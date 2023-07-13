import { Inject, Injectable } from "@nestjs/common";
import { AdminService } from "../admin/admin.service";
import { UsersService } from "../users/users.service";
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { CheckUserResponse, Tokens } from "@Types";
import { configToken } from "../config/config";

@Injectable()
export class AuthService {

  constructor(
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
}
