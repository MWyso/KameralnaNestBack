import { Injectable } from '@nestjs/common';
import { Users } from './entity/users.entity';

@Injectable()
export class UsersService {
  async getUserByEmail(email: string): Promise<Users> {
    return await Users.findOneBy({ email });
  }

  async getUserById(id: string): Promise<Users> {
    return await Users.findOneBy({ id });
  }
}
