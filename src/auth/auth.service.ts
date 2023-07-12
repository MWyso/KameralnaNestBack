import { Inject, Injectable } from "@nestjs/common";
import { AdminService } from "../admin/admin.service";
import { UsersService } from "../users/users.service";
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
    // private jwtService: JwtService,
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
}
