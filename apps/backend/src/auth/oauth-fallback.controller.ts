import { Controller, Get, Req, UseGuards, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

interface OAuthRequest {
  user?: {
    userId?: number;
    username?: string;
    email?: string;
  };
}

/**
 * Fallback OAuth routes without /api prefix
 * Google and GitHub OAuth configs might redirect to /auth/google/callback
 * This controller catches those requests and processes them
 */
@Controller('auth')
export class OAuthFallbackController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirectFallback(@Req() req: OAuthRequest) {
    const result = await this.authService.login(req.user ?? {});
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      url: `${frontendUrl}/callback?token=${result.access_token}`,
      statusCode: 302,
    };
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @Redirect()
  async githubAuthRedirectFallback(@Req() req: OAuthRequest) {
    const result = await this.authService.login(req.user ?? {});
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      url: `${frontendUrl}/callback?token=${result.access_token}`,
      statusCode: 302,
    };
  }
}
