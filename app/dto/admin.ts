import {
  IsBoolean,
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
} from "class-validator";
import { Admin } from "../entity/admin";
import { BasePaginationQuery } from "./base";

export class CreateAdminPayload {
  @IsString()
  name: string;

  @IsBoolean()
  is_active: boolean;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsMongoId()
  role: string;

  auth: Admin;
}

export class GetAdminsQuery extends BasePaginationQuery {
  @IsString()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class EditAdminPayload extends CreateAdminPayload {
  @IsMongoId()
  id: string;
}
