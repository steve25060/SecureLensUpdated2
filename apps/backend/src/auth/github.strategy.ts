import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback',
      scope: ['user:email'],
      userProfileURL: 'https://api.github.com/user',
      allowUnauthorizedTls: false,
    });
    
    console.log('[GithubStrategy] Initialized with:');
    console.log('  - clientID:', process.env.GITHUB_CLIENT_ID ? '✓ SET' : '✗ MISSING');
    console.log('  - clientSecret:', process.env.GITHUB_CLIENT_SECRET ? '✓ SET' : '✗ MISSING');
    console.log('  - callbackURL:', process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback');
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    console.log('[GithubStrategy.validate] Profile:', profile.id, profile.username);
    console.log('[GithubStrategy.validate] Profile data:', JSON.stringify(profile, null, 2));
    
    const user = {
      githubId: String(profile.id),
      username: profile.username,
      email: profile.emails?.[0]?.value || profile.email || `${profile.username}@github.local`,
      name: profile.displayName || profile.name || profile.username || 'GitHub User',
      photo: profile.photos?.[0]?.value || profile.avatar_url,
    };
    console.log('[GithubStrategy] User data:', user);
    done(null, user);
  }
}
