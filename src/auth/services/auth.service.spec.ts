import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from './refresh-token.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from 'src/enums/user-role';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let refreshTokenService: jest.Mocked<RefreshTokenService>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    role: UserRole.User,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findByUsernameOrEmail: jest.fn(),
            create: jest.fn(),
            findOneById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: RefreshTokenService,
          useValue: {
            createRefreshToken: jest.fn(),
            revokeTokens: jest.fn(),
            saveToken: jest.fn(),
            findToken: jest.fn(),
            deleteRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    refreshTokenService = module.get(RefreshTokenService);
  });

  // ---------------------------
  // validateUser
  // ---------------------------
  describe('validateUser', () => {
    it('should return userBase if credentials are valid', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(mockUser.email, 'password');

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should return null if user not found', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser(
        'wrong@example.com',
        'pass',
      );
      expect(result).toBeNull();
    });

    it('should return null if password mismatch', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(mockUser.email, 'wrong');
      expect(result).toBeNull();
    });
  });

  // ---------------------------
  // signUp
  // ---------------------------
  describe('requestSignup', () => {
    it('should create pending registration and send verification code', async () => {
      (userService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      // Mock pendingService and verificationService as needed
      authService['pendingService'] = {
        createPendingRegistration: jest.fn().mockResolvedValue(true),
        findValidCode: jest.fn(),
        deletePending: jest.fn(),
        repo: {},
      };
      authService['verificationService'] = {
        sendOtpVerification: jest.fn().mockResolvedValue(true),
        logger: { log: jest.fn(), error: jest.fn() },
        emailApi: {},
      };
      const result = await authService.requestSignup({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toMatchObject({
        message: expect.stringContaining('Verification code sent'),
      });
    });

    it('should throw ConflictException if user exists', async () => {
      (userService.findByUsernameOrEmail as jest.Mock).mockResolvedValue(
        mockUser,
      );
      await expect(
        authService.requestSignup({
          username: 'duplicate',
          email: 'test@example.com',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ---------------------------
  // signIn
  // ---------------------------
  describe('signIn', () => {
    it('should login user with valid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
      (userService.findOneById as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValueOnce('access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('refresh-token');

      const validDeviceInfo = {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '100',
        device: 'PC',
        deviceType: 'desktop',
        type: 'desktop',
      };
      const mockRequest: any = {
        deviceInfo: validDeviceInfo,
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
      };
      const result = await authService.signIn(
        { email: mockUser.email, password: 'password' },
        mockRequest,
      );

      expect(result).toMatchObject({
        userId: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(() => refreshTokenService.revokeTokens(mockUser.id)).not.toThrow();
      expect(() => refreshTokenService.saveToken({})).not.toThrow();
    });

    it('should throw UnauthorizedException if invalid user', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      const validDeviceInfo2 = {
        os: 'Windows',
        osVersion: '10',
        browser: 'Chrome',
        browserVersion: '100',
        device: 'PC',
        deviceType: 'desktop',
        type: 'desktop',
      };
      const mockRequest2: any = {
        deviceInfo: validDeviceInfo2,
        get: jest.fn(),
        header: jest.fn(),
        accepts: jest.fn(),
        acceptsCharsets: jest.fn(),
      };
      await expect(
        authService.signIn({ email: 'wrong', password: 'wrong' }, mockRequest2),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---------------------------
  // refreshTokens
  // ---------------------------
  describe('refreshTokens', () => {
    it('should rotate and return new tokens', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue({ userId: '1' });
      (refreshTokenService.findToken as jest.Mock).mockResolvedValue(
        'refresh-token',
      );
      (userService.findOneById as jest.Mock).mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockReturnValueOnce('new-access-token');
      (jwtService.sign as jest.Mock).mockReturnValueOnce('new-refresh-token');

      const result = await authService.refreshTokens('refresh-token');
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(authService.refreshTokens('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ---------------------------
  // me
  // ---------------------------
  describe('me', () => {
    it('should return current user info', async () => {
      (userService.findOneById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.me('1');
      expect(result).toEqual({
        userId: '1',
        email: mockUser.email,
        username: mockUser.username,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (userService.findOneById as jest.Mock).mockResolvedValue(null);

      await expect(authService.me('2')).rejects.toThrow(UnauthorizedException);
    });
  });
});
