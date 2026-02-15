import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';

/**
 * Helper function to safely extract cookies from response headers
 * Handles both string and string[] types
 */
function getCookiesFromResponse(response: any): string[] {
  const cookieHeader = response.headers['set-cookie'];
  
  // Ensure header exists (test will fail here with clear message if undefined)
  expect(cookieHeader).toBeDefined();
  
  // Normalize to array safely
  const cookies = Array.isArray(cookieHeader)
    ? cookieHeader
    : cookieHeader
      ? [cookieHeader]
      : [];
  
  return cookies;
}

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should return 400 when body is invalid', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'not-an-email', name: 'A', password: 'weak' })
        .expect(400);
    });

    it('should return 400 when password is missing special char', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com', name: 'Test User', password: 'Password1' })
        .expect(400);
    });

    it('should create user and return tokens with cookie', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Test User',
          password: 'Passw0rd!@',
        })
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(uniqueEmail);
      
      // Check refresh token cookie is set
      const cookies = getCookiesFromResponse(response);
      
      const accessToken = response.body.accessToken;
      const refreshTokenCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(accessToken).toBeDefined();
      expect(refreshTokenCookie).toBeDefined();
    });

    it('should return 409 when email already exists', async () => {
      const existingEmail = `test-${Date.now()}@example.com`;
      
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: existingEmail,
          name: 'Test User',
          password: 'Passw0rd!@',
        });

      // Try again with same email
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: existingEmail,
          name: 'Another User',
          password: 'Passw0rd!@',
        })
        .expect(409);
    });
  });

  describe('POST /auth/signin', () => {
    it('should return 401 with wrong credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/signin')
        .send({ email: 'nobody@example.com', password: 'Passw0rd!' })
        .expect(401);
    });

    it('should sign in and return tokens with cookie', async () => {
      const uniqueEmail = `signin-test-${Date.now()}@example.com`;
      
      // Create user first
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Signin Test',
          password: 'Passw0rd!@',
        });

      // Now sign in
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: uniqueEmail,
          password: 'Passw0rd!@',
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe(uniqueEmail);
      
      const cookies = getCookiesFromResponse(response);
      expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 without refresh token cookie', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .expect(401);
    });

    it('should return new access token with valid refresh token', async () => {
      const uniqueEmail = `refresh-test-${Date.now()}@example.com`;
      
      // Create user and get tokens
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Refresh Test',
          password: 'Passw0rd!@',
        });

      const cookies = getCookiesFromResponse(signupResponse);

      // Wait 1 second to ensure different iat (issued at) timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use refresh token
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.accessToken).not.toBe(signupResponse.body.accessToken); // Should be new token
      
      // Should get new refresh token cookie
      const newCookies = getCookiesFromResponse(response);
      expect(newCookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    });
  });

  describe('GET /auth/profile', () => {
    it('should return 401 without a token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 with a bad token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });

    it('should return user profile with valid token', async () => {
      const uniqueEmail = `profile-test-${Date.now()}@example.com`;
      
      // Create user
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Profile Test',
          password: 'Passw0rd!@',
        });

      const token = signupResponse.body.accessToken;

      // Get profile
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(uniqueEmail);
      expect(response.body.name).toBe('Profile Test');
      expect(response.body.id).toBeDefined();
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear refresh token cookie', async () => {
      const uniqueEmail = `logout-test-${Date.now()}@example.com`;
      
      // Create user
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Logout Test',
          password: 'Passw0rd!@',
        });

      const cookies = getCookiesFromResponse(signupResponse);

      // Logout
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
      
      // Check cookie is cleared (should have Max-Age=0 or be absent)
      const logoutCookies = response.headers['set-cookie'];
      if (logoutCookies) {
        const normalizedCookies = Array.isArray(logoutCookies) 
          ? logoutCookies 
          : [logoutCookies];
        const refreshCookie = normalizedCookies.find((c) => c.startsWith('refreshToken='));
        if (refreshCookie) {
          // Cookie should be expired (either Max-Age=0 or Expires in the past)
          const isExpired = 
            refreshCookie.includes('Max-Age=0') || 
            refreshCookie.includes('Expires=Thu, 01 Jan 1970');
          expect(isExpired).toBe(true);
        }
      }
    });

    it('should not fail when logging out without token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);
    });
  });

  describe('POST /auth/logout-all', () => {
    it('should return 401 without access token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout-all')
        .expect(401);
    });

    it('should logout all devices with valid token', async () => {
      const uniqueEmail = `logout-all-test-${Date.now()}@example.com`;
      
      // Create user
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: uniqueEmail,
          name: 'Logout All Test',
          password: 'Passw0rd!@',
        });

      const token = signupResponse.body.accessToken;

      // Logout all
      const response = await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('Logged out from all');
    });
  });
});