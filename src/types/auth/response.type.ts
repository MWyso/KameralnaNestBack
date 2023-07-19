import { Users } from "../../users/entity/users.entity";
import { Admin } from "../../admin/entity/admin.entity";

export type BasicDataResponse = {
  id: string;
  email: string;
  role: string;
  accessToken?: string;
};

export type AdminDataResponse = {
  name: string;
} & BasicDataResponse;

export type UsersDataResponse = {
  name: string;
} & BasicDataResponse;

export type CheckUserResponse = Admin | Users | null;

export type UserDataResponse = AdminDataResponse | UsersDataResponse;

export type CreateResponse = {
  id: string;
};