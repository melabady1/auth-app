import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request as ExpressRequest, Response } from 'express'; // ← ADD
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, AuthResponseDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../users/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // signUp
  @Post('signup')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async signUp(
    @Body() dto: SignUpDto,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponseDto, 'refreshToken'>> {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || 'unknown';

    const { accessToken, refreshToken, user } = await this.authService.signUp(
      dto,
      userAgent,
      ipAddress,
    );

    // Set refresh token in httpOnly cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken, user };
  }

  // signIn
  @Post('signin')
  @UseGuards(ThrottlerGuard, AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'Signed in successfully', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async signIn(
    @Request() req: ExpressRequest & { user: UserDocument },
    @Res({ passthrough: true }) res: Response,
  ): Promise<Omit<AuthResponseDto, 'refreshToken'>> {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || 'unknown';

    const { accessToken, refreshToken, user } = await this.authService.signIn(
      req.user,
      userAgent,
      ipAddress,
    );

    // Set refresh token in httpOnly cookie
    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken, user };
  }

  // refresh endpoint
  @Post('refresh')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip || 'unknown';

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refresh(
      refreshToken,
      userAgent,
      ipAddress,
    );

    // Set new refresh token in cookie
    this.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken };
  }

  // logout endpoint
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { message: 'Logged out successfully' };
  }

  // logout all devices
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logged out from all devices' })
  async logoutAll(
    @CurrentUser() user: JwtPayload,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const currentRefreshToken = req.cookies?.refreshToken;

    await this.authService.logoutAllDevices(user.sub, currentRefreshToken);

    // If no current refresh token, clear cookie
    if (!currentRefreshToken) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
    }

    return { message: 'Logged out from all other devices' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (protected)' })
  @ApiResponse({ status: 200, description: 'Returns the authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user);
  }

  // helper method
  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });
  }
}