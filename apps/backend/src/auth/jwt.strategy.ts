import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string;
  userId: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  /**
   * Passport attaches the return value to `req.user`. We forward every field
   * the frontend needs (the callback page reads name/email/role off the JWT).
   */
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub ?? payload.userId,
      id: payload.sub ?? payload.userId,
      username: payload.username ?? payload.name,
      name: payload.name,
      email: payload.email,
      avatarUrl: payload.avatarUrl,
      role: payload.role,
    };
  }
}
