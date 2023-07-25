import { Body, Controller, Post } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { ApiResponse, CreateResponse } from "@Types";
import { UserDto } from "../users/dto";

@Controller('admin')
export class AdminController {

  constructor(private usersService: UsersService) {}
  @Post('/user/create')
  createUser(@Body() formData: UserDto): Promise<ApiResponse<CreateResponse>> {
    return this.usersService.createUser(formData);
  }
}
