import { Inject, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { AdminService } from "../admin/admin.service";
import { UsersService } from "../users/users.service";
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse, CheckUserResponse, Tokens, UserDataResponse } from "@Types";
import { configCookie, configToken } from "../config/config";
import { InvalidCredentialsException } from "../common/exceptions/invalid-credentials.exception";
import { Users } from "../users/entity/users.entity";
import { LoginUserDto } from "./dto";
import { Admin } from "../admin/entity/admin.entity";
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';

@Injectable()
export class AuthService {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private adminService: AdminService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
  }

  async hashData(data: string): Promise<string> {
    const hashedData = await bcryptjs.hash(data, 10);
    if (!hashedData.includes('/')) {
      return hashedData;
    } else {
      return await this.hashData(data);
    }
  }

  async compareHashedData(plainText: string, hashedText: string): Promise<boolean> {
    return await bcryptjs.compare(plainText, hashedText);
  }

  async updateRtHash(id, rt: string): Promise<void> {
    const user = await this.checkUserById(id);
    user.refreshToken = await this.hashData(rt);
    await user.save();
  }

  async generateEmailToken(id, email): Promise<string> {
    return await this.jwtService.signAsync(
      { id, email },
      {
        secret: configToken.secretKeyMt,
        expiresIn: configToken.expiresInMt,
      },
    );
  }

  async getTokens(id: string, email: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { id, email },
        {
          secret: configToken.secretKeyAt,
          expiresIn: configToken.expiresInAt,
        },
      ),
      this.jwtService.signAsync(
        { id, email },
        {
          secret: configToken.secretKeyRt,
          expiresIn: configToken.expiresInRt,
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  async checkEmail(email: string): Promise<boolean> {
    return !!(await this.checkUserByEmail(email));
  }

  async getUserData(user): Promise<UserDataResponse> {
    const obj = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    if (user instanceof Admin) {
      return {
        ...obj,
        name: user.name,
      };
    }
    if (user instanceof Users) {
      return {
        ...obj,
        name: user.name,
      };
    }
  }

  async checkUserByEmail(email: string): Promise<CheckUserResponse> {
    const admin = await this.adminService.getAdminByEmail(email);
    const user = await this.usersService.getUserByEmail(email);

    return user ? user :  admin ? admin : null;
  }

  async checkUserById(id: string): Promise<CheckUserResponse> {
    const admin = await this.adminService.getUserById(id);
    const user = await this.usersService.getUserById(id);

    return user ? user :  admin ? admin : null;
  }

  async login(login: LoginUserDto, response: Response): Promise<ApiResponse<UserDataResponse>> {
    const user = await this.checkUserByEmail(login.email);
    if (!user) throw new InvalidCredentialsException();
    if (user instanceof Users && !user.active)
      throw new HttpException('Konto jest nieaktywne!', HttpStatus.BAD_REQUEST);

    const passwordMatches = await this.compareHashedData(login.password, user.password);
    if (!passwordMatches) throw new InvalidCredentialsException();

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    response.cookie('jwt-refresh', tokens.refreshToken, {
      httpOnly: configCookie.httpOnly,
      domain: configCookie.domain,
      secure: configCookie.secure,
    });
    return {
      isSuccess: true,
      payload: { ...(await this.getUserData(user)), accessToken: tokens.accessToken },
    };
  }

  async logout(id: string, res: Response): Promise<ApiResponse<any>> {
    const user = await this.checkUserById(id);
    if (!user) throw new HttpException('Nie ma takiego użytkownika w systemie', HttpStatus.NOT_FOUND);
    if (user.refreshToken !== null) {
      user.refreshToken = null;
      await user.save();
      await this.cacheManager.del(`filter-${id}`);
      res.clearCookie('jwt-refresh', {
        httpOnly: configCookie.httpOnly,
        domain: configCookie.domain,
        secure: configCookie.secure,
      });
      return {
        isSuccess: true,
        payload: null,
      };
    }
  }

  async refreshTokens(id: string, rt: string, res: Response): Promise<ApiResponse<Tokens>> {
    const user = await this.checkUserById(id);

    if (!user || !user.refreshToken) throw new Error();

    const rtMatches = await this.compareHashedData(rt, user.refreshToken);
    if (!rtMatches) throw new InvalidCredentialsException();
    try {
      const tokens = await this.getTokens(user.id, user.email);
      await this.updateRtHash(user.id, tokens.refreshToken);
      res.cookie('jwt-refresh', tokens.refreshToken, {
        httpOnly: configCookie.httpOnly,
        domain: configCookie.domain,
        secure: configCookie.secure,
      });
      return {
        isSuccess: true,
        payload: {
          accessToken: tokens.accessToken,
        },
      };
    } catch (e) {
      throw new InvalidCredentialsException();
    }
  }
}
