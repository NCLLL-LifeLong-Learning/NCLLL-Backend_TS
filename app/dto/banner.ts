import {
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { TipTapContentDto } from "./blog";
import { Type } from "class-transformer";

/* ------------------------------------------------------ */
/*                         Payload                        */
/* ------------------------------------------------------ */
export class CreateBannerPayload {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TipTapContentDto)
  document_en: TipTapContentDto;

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TipTapContentDto)
  document_kh: TipTapContentDto;
}

export class EditBannerPayload extends CreateBannerPayload {
  @IsMongoId()
  id: string;
}
