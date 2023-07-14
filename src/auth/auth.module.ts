import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { UsersModule } from "../users/users.module";
import { AdminModule } from "../admin/admin.module";
import { AuthService } from "./auth.service";
import { AtStrategy, MtStrategy, RtStrategy } from "./stratrgies";
import { JwtModule } from "@nestjs/jwt";


@Module({
  imports: [
    forwardRef(() => AdminModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => JwtModule.register({})),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, MtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
