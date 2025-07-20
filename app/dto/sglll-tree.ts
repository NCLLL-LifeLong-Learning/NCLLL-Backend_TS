import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsMongoId,
  Min,
} from "class-validator";
import { BasePaginationQuery } from "./base";
import { Type } from "class-transformer";

export class CreateSglllTreePayload {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  term: number;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image_url_kh: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image_url_en: string;
}

export class EditSglllTreePayload extends CreateSglllTreePayload {
  @IsMongoId()
  id: string;
}
export class SglllTreeQueryDto extends BasePaginationQuery {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  term?: number;

  @IsString()
  @IsOptional()
  keyword?: string;
}
