import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { RefreshToken } from '../schemas/refresh-token.schema';

const mockLogger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };

const mockUser = {
  _id: 'user-id-123',
  email: 'jane@example.com',
  name: 'Jane Doe',
  password: 'hashed',
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  validatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
    return config[key];
  }),
};

const mockRefreshTokenModel = {
  create: jest.fn().mockResolvedValue({
    userId: 'user-id-123',
    token: 'mock-refresh-token',
    expiresAt: new Date(),
  }),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken(RefreshToken.name), useValue: mockRefreshTokenModel },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should create a user and return tokens', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.signUp(
        {
          email: 'jane@example.com',
          name: 'Jane Doe',
          password: 'Passw0rd!',
        },
        'Mozilla/5.0',
        '127.0.0.1',
      );

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.name).toBe('Jane Doe');
      expect(mockRefreshTokenModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('An account with this email already exists'),
      );

      await expect(
        service.signUp(
          { email: 'jane@example.com', name: 'Jane Doe', password: 'Passw0rd!' },
          'Mozilla/5.0',
          '127.0.0.1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('jane@example.com', 'Passw0rd!');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nobody@example.com', 'Passw0rd!');
      expect(result).toBeNull();
    });

    it('should return null when password is wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await service.validateUser('jane@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should return tokens for a valid user', async () => {
      const result = await service.signIn(mockUser as any, 'Mozilla/5.0', '127.0.0.1');
      
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('jane@example.com');
      expect(mockRefreshTokenModel.create).toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const mockStoredToken = {
        userId: 'user-id-123',
        token: 'old-refresh-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // future date
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
      };

      mockRefreshTokenModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoredToken),
      });
      mockRefreshTokenModel.deleteOne.mockResolvedValue({ deletedCount: 1 });
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.refresh('old-refresh-token', 'Mozilla/5.0', '127.0.0.1');

      expect(result.accessToken).toBe('mock.jwt.token');
      expect(result.refreshToken).toBeDefined();
      expect(mockRefreshTokenModel.deleteOne).toHaveBeenCalledWith({
        token: 'old-refresh-token',
      });
      expect(mockRefreshTokenModel.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      mockRefreshTokenModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.refresh('invalid-token', 'Mozilla/5.0', '127.0.0.1'),
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw UnauthorizedException when refresh token expired', async () => {
      const expiredToken = {
        userId: 'user-id-123',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 1000), // past date
        userAgent: 'Mozilla/5.0',
        ipAddress: '127.0.0.1',
      };

      mockRefreshTokenModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expiredToken),
      });
      mockRefreshTokenModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await expect(
        service.refresh('expired-token', 'Mozilla/5.0', '127.0.0.1'),
      ).rejects.toThrow('Refresh token expired');
    });
  });

  describe('logout', () => {
    it('should delete refresh token from database', async () => {
      mockRefreshTokenModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.logout('some-refresh-token');

      expect(mockRefreshTokenModel.deleteOne).toHaveBeenCalledWith({
        token: 'some-refresh-token',
      });
    });

    it('should handle logout with invalid token gracefully', async () => {
      mockRefreshTokenModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.logout('invalid-token')).resolves.not.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith('Logout attempted with invalid token');
    });
  });

  describe('logoutAllDevices', () => {
    it('should delete all refresh tokens for user', async () => {
      mockRefreshTokenModel.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await service.logoutAllDevices('user-id-123');

      expect(mockRefreshTokenModel.deleteMany).toHaveBeenCalledWith({ userId: 'user-id-123' });
    });

    it('should keep current session when token provided', async () => {
      mockRefreshTokenModel.deleteMany.mockResolvedValue({ deletedCount: 2 });

      await service.logoutAllDevices('user-id-123', 'current-token');

      expect(mockRefreshTokenModel.deleteMany).toHaveBeenCalledWith({
        userId: 'user-id-123',
        token: { $ne: 'current-token' },
      });
    });
  });

  describe('getProfile', () => {
    it('should return profile from JWT payload', () => {
      const payload = { sub: 'user-id-123', email: 'jane@example.com', name: 'Jane Doe' };
      const profile = service.getProfile(payload);
      expect(profile).toEqual({ id: 'user-id-123', email: 'jane@example.com', name: 'Jane Doe' });
    });
  });
});