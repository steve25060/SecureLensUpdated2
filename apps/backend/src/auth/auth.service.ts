import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { hashPassword, verifyPassword, validatePasswordStrength } from './password.util';

export interface OAuthProfile {
  githubId?: string;
  googleId?: string;
  username?: string;
  email?: string;
  name?: string;
  photo?: string;
}

/**
 * Demo credentials accepted by `validateUser` when the database is unreachable
 * (so the app is still explorable without Postgres). When Postgres IS reachable,
 * the demo user is also seeded into the DB so workspaces/scans can satisfy FKs.
 */
const DEMO_EMAIL = 'demo@example.com';
const DEMO_USER_ID = 'demo-user-1';
const DEMO_PASSWORD = 'demo';
const DEMO_USERS = ['test@gmail.com', 'test', 'demo'];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // ─── Registration (email + password) ────────────────────────────────────────

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    // Policy check
    const strengthError = validatePasswordStrength(dto.password);
    if (strengthError) {
      throw new UnauthorizedException(strengthError);
    }
    if (dto.confirmPassword !== undefined && dto.confirmPassword !== dto.password) {
      throw new UnauthorizedException('Passwords do not match');
    }

    // Database available → real persistence
    const existing = await this.safeQuery(() =>
      this.prisma.user.findFirst({ where: { email } }),
    );
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const created = await this.safeQuery(() =>
      this.prisma.user.create({
        data: {
          email,
          name: dto.name.trim(),
          passwordHash: hashPassword(dto.password),
          role: 'USER',
        },
      }),
    );
    if (created) {
      this.logger.log(`Registered new user: ${created.id} (${email})`);
      return this.issueToken(created);
    }

    // DB query failed (offline, schema mismatch, etc.) — fall through to a
    // working token so registration never returns a 500. The user can still
    // use the app in demo mode; data is held in the file-backed stores.
    this.logger.warn('DB unavailable during register — issuing ephemeral token');
    return this.issueToken({
      id: DEMO_USER_ID,
      email,
      name: dto.name.trim(),
      avatarUrl: null,
      role: 'USER',
      githubId: null,
      googleId: null,
    } as any);
  }

  // ─── Login (email + password) ───────────────────────────────────────────────

  async validateUser(loginDto: LoginDto) {
    const submitted = loginDto.username.trim();
    const isDemoCreds =
      DEMO_USERS.includes(submitted.toLowerCase()) && loginDto.password === DEMO_PASSWORD;

    // Look up a real DB user by email (DB stores emails lowercased).
    const dbUser = await this.safeQuery(() =>
      this.prisma.user.findFirst({ where: { email: submitted.toLowerCase() } }),
    );
    if (dbUser) {
      if (!dbUser.passwordHash) {
        // OAuth-only account → reject password login
        throw new UnauthorizedException(
          'This account uses social sign-in. Please log in with Google or GitHub.',
        );
      }
      if (!verifyPassword(loginDto.password, dbUser.passwordHash)) {
        throw new UnauthorizedException('Invalid email or password');
      }
      return this.issueToken(dbUser);
    }

    // No real user matched. If demo creds were provided, seed the demo user
    // so the rest of the app (workspaces/scans) works against the DB.
    if (isDemoCreds) {
      const seeded = await this.ensureDemoUser();
      return this.issueToken(seeded);
    }

    throw new UnauthorizedException('Invalid email or password');
  }

  // ─── OAuth (Google / GitHub) ────────────────────────────────────────────────

  /**
   * Called by OAuth callbacks after the Passport strategy has validated the
   * user and attached a profile to req.user.
   */
  async login(profile: OAuthProfile) {
    this.logger.debug(`OAuth login for ${profile.email ?? profile.githubId ?? profile.googleId}`);

    // Try to find an existing user, then create one if needed. Every Prisma
    // call goes through safeQuery, so a DB outage degrades to an ephemeral
    // demo token instead of a 500 (which would strand the user after OAuth).
    let dbUser = await this.findOAuthUser(profile);

    if (!dbUser) {
      const email = (profile.email ?? '').trim().toLowerCase();
      if (!email) {
        // No email from provider — can't create a real account, but don't 500.
        this.logger.warn('OAuth provider returned no email; issuing ephemeral token');
        return this.issueToken({
          id: DEMO_USER_ID,
          email: DEMO_EMAIL,
          name: profile.name ?? 'OAuth User',
          avatarUrl: profile.photo ?? null,
          role: 'USER',
          githubId: profile.githubId ?? null,
          googleId: profile.googleId ?? null,
        } as any);
      }
      dbUser = await this.safeQuery(() =>
        this.prisma.user.create({
          data: {
            email,
            name: profile.name ?? 'OAuth User',
            avatarUrl: profile.photo,
            role: 'USER',
            ...(profile.githubId && { githubId: profile.githubId }),
            ...(profile.googleId && { googleId: profile.googleId }),
          },
        }),
      );
      if (dbUser) {
        this.logger.log(`Created OAuth user: ${dbUser.id}`);
      } else {
        // Create failed (likely a unique collision). Try to link/lookup again.
        dbUser = (await this.linkOAuthIdentity(profile)) ?? (await this.findOAuthUser(profile));
      }
    }

    if (dbUser) return this.issueToken(dbUser);

    // All DB attempts failed — fall through to an ephemeral token.
    this.logger.warn('DB unavailable during OAuth login — issuing ephemeral token');
    return this.issueToken({
      id: DEMO_USER_ID,
      email: profile.email ?? DEMO_EMAIL,
      name: profile.name ?? 'OAuth User',
      avatarUrl: profile.photo ?? null,
      role: 'USER',
      githubId: profile.githubId ?? null,
      googleId: profile.googleId ?? null,
    } as any);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findOAuthUser(profile: OAuthProfile) {
    const or: any[] = [];
    if (profile.githubId) or.push({ githubId: profile.githubId });
    if (profile.googleId) or.push({ googleId: profile.googleId });
    if (profile.email) or.push({ email: profile.email.trim().toLowerCase() });
    if (or.length === 0) return null;
    return this.safeQuery(() => this.prisma.user.findFirst({ where: { OR: or } }));
  }

  private async linkOAuthIdentity(profile: OAuthProfile) {
    if (!profile.email) return null;
    const email = profile.email.trim().toLowerCase();
    return this.safeQuery(() =>
      this.prisma.user.update({
        where: { email },
        data: {
          ...(profile.githubId && { githubId: profile.githubId }),
          ...(profile.googleId && { googleId: profile.googleId }),
          ...(profile.photo && { avatarUrl: profile.photo }),
          ...(profile.name && { name: profile.name }),
        },
      }),
    );
  }

  /** Seed the demo user into Postgres so FKs on workspaces/scans succeed. */
  async ensureDemoUser() {
    if (!this.prisma.connected) {
      return {
        id: DEMO_USER_ID,
        email: DEMO_EMAIL,
        name: 'Demo User',
        avatarUrl: null,
        role: 'USER',
        githubId: null,
        googleId: null,
      } as any;
    }
    const existing = await this.safeQuery(() =>
      this.prisma.user.findFirst({ where: { email: DEMO_EMAIL } }),
    );
    if (existing) return existing;

    try {
      return await this.prisma.user.create({
        data: {
          id: DEMO_USER_ID,
          email: DEMO_EMAIL,
          name: 'Demo User',
          passwordHash: hashPassword(DEMO_PASSWORD),
          role: 'USER',
        },
      });
    } catch (err: any) {
      // If the ID already exists (race), fetch it.
      this.logger.warn(`Demo user create failed (${err.message}); fetching existing.`);
      return (
        (await this.safeQuery(() => this.prisma.user.findUnique({ where: { id: DEMO_USER_ID } }))) ??
        (await this.safeQuery(() => this.prisma.user.findFirst({ where: { email: DEMO_EMAIL } })))
      );
    }
  }

  private async safeQuery<T>(fn: () => Promise<T>): Promise<T | null> {
    try {
      return await fn();
    } catch (err: any) {
      this.logger.error(`DB query failed: ${err?.message ?? err}`);
      return null;
    }
  }

  private issueToken(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
    role?: string;
    githubId?: string | null;
    googleId?: string | null;
  }) {
    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      username: user.name,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role ?? 'USER',
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
        role: user.role ?? 'USER',
        githubId: user.githubId ?? null,
        googleId: user.googleId ?? null,
      },
    };
  }
}
