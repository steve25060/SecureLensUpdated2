import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
    
    console.log('[GoogleStrategy] Initialized with:');
    console.log('  - clientID:', process.env.GOOGLE_CLIENT_ID ? '✓ SET' : '✗ MISSING');
    console.log('  - clientSecret:', process.env.GOOGLE_CLIENT_SECRET ? '✓ SET' : '✗ MISSING');
    console.log('  - callbackURL:', process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback');
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    console.log('[GoogleStrategy.validate] Profile:', profile.id, profile.emails?.[0]?.value);
    const user = {
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      photo: profile.photos?.[0]?.value,
    };
    console.log('[GoogleStrategy] User data:', user);
    done(null, user);
  }
}
