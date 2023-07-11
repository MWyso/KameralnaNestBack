import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from './auth.controller';
import { UsersModule } from "../users/users.module";
import { AdminModule } from "../admin/admin.module";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    forwardRef(() => AdminModule),
    forwardRef(() => UsersModule),
    forwardRef(() => AuthModule),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
