import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class EditWebsiteSettingsPayload {
  @Type(() => Boolean)
  maintenanceMode: Boolean;

  @IsString()
  @IsOptional()
  maintenance_key?: string;
}
