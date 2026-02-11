import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @ApiProperty({ example: 'jane@example.com', description: 'Valid email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Full name (min 3 characters)' })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters' })
  @MaxLength(50, { message: 'Name must be under 50 characters' })
  name: string;

  @ApiProperty({
    example: 'Passw0rd!',
    description:
      'Min 8 chars, at least one letter, one number, and one special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}

export class SignInDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from httpOnly and secure cookie' })
  @IsString()
  @MinLength(1)
  refreshToken: string;
}

// MODIFY AuthResponseDto to include refreshToken:
export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token (default to: 5 min expiry)' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh token (default to: 1 day expiry)' })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user',
    example: { id: '64a1b2c3...', email: 'jane@example.com', name: 'Jane Doe' },
  })
  user: {
    id: string;
    email: string;
    name: string;
  };
}