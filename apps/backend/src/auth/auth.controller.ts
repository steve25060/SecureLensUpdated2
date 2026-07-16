import { Controller, Post, Body, Get, Req, UseGuards, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/** Minimal shape of the request object used in this controller. */
interface OAuthRequest {
  user?: {
    userId?: number;
    username?: string;
    email?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto);
  }

  // Demo/Test token endpoint
  @Get('demo-token')
  async getDemoToken() {
    return this.authService.login({ username: 'demo', email: 'demo@example.com' });
  }

  // --- GITHUB OAUTH ROUTES ---

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth(@Req() _req: OAuthRequest) {
    // Passport redirects to GitHub – no body needed here
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @Redirect()
  async githubAuthRedirect(@Req() req: OAuthRequest) {
    // Get the token from auth service
    const result = await this.authService.login(req.user ?? {});
    
    // Get frontend URL from environment (default to localhost:3000)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Redirect to frontend callback route with token in query parameter
    console.log('[GitHubCallback] Redirecting to:', `${frontendUrl}/callback?token=${result.access_token}`);
    
    return {
      url: `${frontendUrl}/callback?token=${result.access_token}`,
      statusCode: 302,
    };
  }

  // --- GOOGLE OAUTH ROUTES ---

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: OAuthRequest) {
    // Passport redirects to Google – no body needed here
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirect(@Req() req: OAuthRequest) {
    // Get the token from auth service
    const result = await this.authService.login(req.user ?? {});
    
    // Get frontend URL from environment (default to localhost:3000)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Redirect to frontend callback route with token in query parameter
    console.log('[GoogleCallback] Redirecting to:', `${frontendUrl}/callback?token=${result.access_token}`);
    
    return {
      url: `${frontendUrl}/callback?token=${result.access_token}`,
      statusCode: 302,
    };
  }
}
