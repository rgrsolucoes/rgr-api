import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { LoginRequest, JwtPayload } from '../types';
import { config } from '../config/env';
import { TokenBlacklistModel } from '../models/TokenBlacklist';

export class AuthService {
  
  static async login(loginData: LoginRequest) {
    const { login, password } = loginData;

    // Find user by login
    const user = await UserModel.findByLogin(login);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
   // const isPasswordValid = await bcrypt.compare(password, user.cp064);
    const isPasswordValid = password === user.cp064acc;
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      cp050: user.cp050,
      cp010: user.cp010
    });

    return {
      ...tokens,
      user: {
        cp050: user.cp050,
        cp010: user.cp010
      }
    };
  }

  static generateTokens(payload: { cp050: string; cp010: number }) {
    const secret = String(config.JWT_SECRET);
    
    // @ts-expect-error - TypeScript has issues with jwt.sign overloads
    const accessToken = jwt.sign(
      payload,
      secret,
      { 
        expiresIn: String(config.JWT_EXPIRES_IN),
        issuer: 'rgr-api'
      }
    );

    // @ts-expect-error - TypeScript has issues with jwt.sign overloads
    const refreshToken = jwt.sign(
      payload,
      secret,
      { 
        expiresIn: String(config.JWT_REFRESH_EXPIRES_IN),
        issuer: 'rgr-api'
      }
    );

    return {
      token: accessToken,
      refreshToken
    };
  }

  static async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, String(config.JWT_SECRET)) as JwtPayload;
      
      // Verify user still exists
      const user = await UserModel.findByLoginAndCompany(decoded.cp050, decoded.cp010);
      if (!user) {
        throw new Error('User no longer exists');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, String(config.JWT_SECRET)) as JwtPayload;
      
      // Verify user still exists
      const user = await UserModel.findByLoginAndCompany(decoded.cp050, decoded.cp010);
      if (!user) {
        throw new Error('User no longer exists');
      }

      // Generate new tokens
      return this.generateTokens({
        cp050: decoded.cp050,
        cp010: decoded.cp010
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.BCRYPT_ROUNDS);
  }

  static async blacklistToken(token: string, userLogin: string, expiresAt: Date): Promise<void> {
    await TokenBlacklistModel.addToken(token, userLogin, expiresAt);
  }
}
