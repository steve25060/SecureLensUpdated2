import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { OAuthFallbackController } from './oauth-fallback.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { GithubStrategy } from './github.strategy';
import { GoogleStrategy } from './google.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController, OAuthFallbackController],
  providers: [AuthService, JwtStrategy, GithubStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
