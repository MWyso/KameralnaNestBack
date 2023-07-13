import { Users } from "../../users/entity/users.entity";
import { Admin } from "../../admin/entity/admin.entity";

export type CheckUserResponse = Admin | Users | null;