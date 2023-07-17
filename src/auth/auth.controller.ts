import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response } from 'express';
import { LoginUserDto } from "./dto";
import { ApiResponse, UserDataResponse } from "@Types";
import { GetUserId, Public } from "../common/decorators";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Public()
  @Post('/login')
  async login(
    @Body() loginData: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ApiResponse<UserDataResponse>> {
    return await this.authService.login(loginData, response);
  }

  @Post('/logout')
  logout(@GetUserId() id: string, @Res({ passthrough: true }) res: Response): Promise<any> {
    return this.authService.logout(id, res);
  }
}