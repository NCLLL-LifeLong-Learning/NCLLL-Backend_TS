import {
  prop,
  modelOptions,
  getModelForClass,
  index,
} from "@typegoose/typegoose";
import { Content, TipTapDocument } from "./blog";

@index({ title: 1 }, { unique: true })
class Banner {
  @prop({ required: true })
  title: string;

  @prop({ required: true })
  imageUrl: string;

  @prop()
  created_at: Date;

  @prop()
  updated_at: Date;

  @prop()
  deleted_at: Date;

  @prop()
  document_en: TipTapDocument;

  @prop()
  document_kh: TipTapDocument;
}

export const BannerModel = getModelForClass(Banner);
