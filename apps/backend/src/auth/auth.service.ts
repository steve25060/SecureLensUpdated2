import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /** Called by POST /auth/login with email+password credentials. */
  async validateUser(loginDto: LoginDto) {
    // Demo login - no database required
    // Accept: test@gmail.com/test, test/test, demo/demo
    const isValidUsername = loginDto.username === 'test@gmail.com' || 
                           loginDto.username === 'test' || 
                           loginDto.username === 'demo';
    const isValidPassword = loginDto.password === 'test' || 
                           loginDto.password === 'demo';

    if (!isValidUsername || !isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Create JWT payload
    const payload = { 
      userId: 'demo-user-1',
      username: loginDto.username, 
      email: 'demo@example.com',
      sub: 'demo-user-1'
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: 'demo-user-1',
        email: 'demo@example.com',
        name: 'Demo User',
        role: 'USER'
      }
    };
  }

  /**
   * Called by OAuth callbacks (GitHub, Google) after the strategy
   * has already validated the user and attached a profile to req.user.
   */
  async login(user: {
    githubId?: string;
    username?: string;
    googleId?: string;
    email?: string;
    name?: string;
    photo?: string;
  }) {
    console.log('[AuthService.login] Received user:', user);

    let dbUser;

    // Try to find existing user by GitHub ID
    if (user.githubId) {
      try {
        dbUser = await this.prisma.user.findUnique({
          where: { githubId: user.githubId },
        });
        console.log('[AuthService] Found user by githubId:', dbUser?.id);
      } catch (err) {
        console.log('[AuthService] Error finding by githubId:', err instanceof Error ? err.message : err);
      }
    }

    // Try to find existing user by Google ID
    if (!dbUser && user.googleId) {
      try {
        dbUser = await this.prisma.user.findUnique({
          where: { googleId: user.googleId },
        });
        console.log('[AuthService] Found user by googleId:', dbUser?.id);
      } catch (err) {
        console.log('[AuthService] Error finding by googleId:', err instanceof Error ? err.message : err);
      }
    }

    // Try to find existing user by email (use findFirst as fallback since email lookup might fail)
    if (!dbUser && user.email) {
      try {
        // Use findFirst instead of findUnique to avoid unique constraint issues
        dbUser = await this.prisma.user.findFirst({
          where: { email: user.email },
        });
        console.log('[AuthService] Found user by email:', dbUser?.id);
      } catch (err) {
        console.log('[AuthService] Error finding by email:', err instanceof Error ? err.message : err);
      }
    }

    // Create new user if doesn't exist
    if (!dbUser) {
      try {
        console.log('[AuthService] Creating new user...');
        const email = user.email || `${user.username || user.githubId || user.googleId}@oauth.local`;
        const name = user.name || user.username || 'OAuth User';
        
        console.log('[AuthService] Using email:', email, 'name:', name);
        
        const createPayload = {
          email,
          name,
          role: 'USER',
          ...(user.githubId && { githubId: user.githubId }),
          ...(user.googleId && { googleId: user.googleId }),
          ...(user.photo && { avatarUrl: user.photo }),
        };
        
        console.log('[AuthService] Create payload:', JSON.stringify(createPayload));
        
        dbUser = await (this.prisma.user.create as any)({
          data: createPayload,
        });
        console.log('[AuthService] Created new user:', dbUser.id);
      } catch (err) {
        console.error('[AuthService] ERROR creating user:', err);
        throw err;
      }
    } else {
      // Update existing user with OAuth IDs
      dbUser = await this.prisma.user.update({
        where: { id: dbUser.id },
        data: {
          ...(user.githubId && { githubId: user.githubId }),
          ...(user.googleId && { googleId: user.googleId }),
          ...(user.photo && { avatarUrl: user.photo }),
          ...(user.name && { name: user.name }),
        },
      });
      console.log('[AuthService] Updated user:', dbUser.id);
    }

    // Generate JWT token
    const payload = {
      userId: dbUser.id,
      email: dbUser.email,
      username: dbUser.name,
      sub: dbUser.id,
    };
    
    console.log('[AuthService] Generating JWT for user:', dbUser.id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        role: dbUser.role,
        githubId: dbUser.githubId,
        googleId: dbUser.googleId,
      },
    };
  }
}
