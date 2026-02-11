import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/user.schema';
import { SignUpDto, AuthResponseDto } from './dto/auth.dto';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      this.logger.warn('Sign-in attempt for unknown email', { email });
      return null;
    }

    const isValid = await this.usersService.validatePassword(password, user.password);
    if (!isValid) {
      this.logger.warn('Sign-in failed – wrong password', { email });
      return null;
    }

    return user;
  }

  async signUp(dto: SignUpDto, userAgent: string, ipAddress: string): Promise<AuthResponseDto> {
    const user = await this.usersService.create(dto.email, dto.name, dto.password);
    const { accessToken, refreshToken } = await this.generateTokens(user, userAgent, ipAddress);

    this.logger.info('User signed up successfully', { userId: user._id });

    return {
      accessToken,
      refreshToken,
      user: { id: String(user._id), email: user.email, name: user.name },
    };
  }

  async signIn(user: UserDocument, userAgent: string, ipAddress: string): Promise<AuthResponseDto> {
    const { accessToken, refreshToken } = await this.generateTokens(user, userAgent, ipAddress);

    this.logger.info('User signed in', { userId: user._id });

    return {
      accessToken,
      refreshToken,
      user: { id: String(user._id), email: user.email, name: user.name },
    };
  }

  async refresh(
    oldRefreshToken: string,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const stored = await this.refreshTokenModel.findOne({ token: oldRefreshToken }).exec();

    if (!stored) {
      this.logger.warn('Refresh token not found or already used – possible reuse attack');
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await this.refreshTokenModel.deleteOne({ token: oldRefreshToken });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check device fingerprint (basic check)
    if (stored.userAgent !== userAgent) {
      this.logger.warn('Refresh token used from different device', {
        userId: stored.userId,
        storedUA: stored.userAgent,
        currentUA: userAgent,
      });
      // Optional: you can throw here for strict security
    }

    // Get user
    const user = await this.usersService.findById(String(stored.userId));
    if (!user) {
      await this.refreshTokenModel.deleteOne({ token: oldRefreshToken });
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token (rotation)
    await this.refreshTokenModel.deleteOne({ token: oldRefreshToken });

    // Generate new tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, userAgent, ipAddress);

    this.logger.info('Tokens refreshed', { userId: user._id });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    const result = await this.refreshTokenModel.deleteOne({ token: refreshToken });
    
    if (result.deletedCount === 0) {
      this.logger.warn('Logout attempted with invalid token');
    } else {
      this.logger.info('User logged out');
    }
  }


  async logoutAllDevices(userId: string, currentRefreshToken?: string): Promise<void> {
    if (currentRefreshToken) {
      // Keep current session, delete all others
      await this.refreshTokenModel.deleteMany({
        userId,
        token: { $ne: currentRefreshToken },
      });
      this.logger.info('All other sessions logged out', { userId });
    } else {
      // Delete all sessions
      await this.refreshTokenModel.deleteMany({ userId });
      this.logger.info('All sessions logged out', { userId });
    }
  }

  getProfile(user: { sub: string; email: string; name: string }) {
    return { id: user.sub, email: user.email, name: user.name };
  }

 
  private async generateTokens(
    user: UserDocument,
    userAgent: string,
    ipAddress: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: String(user._id),
      email: user.email,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token in DB
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '1d');
    const expiresAt = this.calculateExpiry(expiresIn);

    await this.refreshTokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt,
      userAgent,
      ipAddress,
      lastUsedAt: new Date(),
    });

    return { accessToken, refreshToken };
  }

  // helper to generate secure random token
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  // helper to calculate expiry date
  private calculateExpiry(duration: string): Date {
    const now = new Date();
    const match = duration.match(/^(\d+)([smhd])$/);
    
    if (!match) return new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // default 1 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(now.getTime() + value * multipliers[unit]);
  }
}