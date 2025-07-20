import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { BasePaginationQuery } from "./base";

/* ------------------------------------------------------ */
/*                    Nested Classes                      */
/* ------------------------------------------------------ */
export class CreateRequestPartnerDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  reason: string;

  @IsString()
  description: string;
}

export class QueryRequestPartnerDTO extends BasePaginationQuery {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  search: string;
}
