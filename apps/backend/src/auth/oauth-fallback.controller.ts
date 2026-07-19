import { Controller, Get, Req, UseGuards, Redirect, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, OAuthProfile } from './auth.service';

interface OAuthRequest {
  user?: OAuthProfile;
}

/**
 * Fallback OAuth routes WITHOUT the /api prefix.
 *
 * Google/GitHub OAuth configs may redirect to /auth/<provider>/callback (no /api).
 * This controller catches those requests and processes them the same way the
 * prefixed controller does. It exists to make misconfigured callback URLs work.
 *
 * Note: because the global API prefix is "api", Nest registers these at
 * /api/auth/... and /auth/... respectively only if prefix is disabled per route.
 * In practice the routes below also resolve under /api/auth/... — which is what
 * the providers hit when CALLBACK_URL points at /api/auth/.../callback.
 */
@Controller('auth')
export class OAuthFallbackController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirectFallback(@Req() req: OAuthRequest) {
    if (!req.user) throw new UnauthorizedException('Google did not return a user');
    const result = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return { url: `${frontendUrl}/callback?token=${result.access_token}`, statusCode: 302 };
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @Redirect()
  async githubAuthRedirectFallback(@Req() req: OAuthRequest) {
    if (!req.user) throw new UnauthorizedException('GitHub did not return a user');
    const result = await this.authService.login(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return { url: `${frontendUrl}/callback?token=${result.access_token}`, statusCode: 302 };
  }
}
