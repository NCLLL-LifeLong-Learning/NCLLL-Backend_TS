import {
  prop,
  modelOptions,
  getModelForClass,
  index,
  Ref,
} from "@typegoose/typegoose";
import { Ministry } from "./ministry";
import { FileObject } from "./base/file-object";

@index({ title: 1, lang: 1 })
class Resource {
  @prop({ required: true })
  title: string;

  @prop({ required: true })
  lang: string;

  @prop({ required: true })
  cover: string;

  @prop({
    type: () => FileObject,
    _id: true, // <- important to assign ObjectId to each subdocument
    default: [],
  })
  file: FileObject[];

  @prop({ required: true })
  type: string;

  @prop()
  sub_type: string;

  @prop({ required: true })
  publishedAt: Date;

  @prop({ ref: () => Ministry, required: true })
  source: Ref<Ministry>;

  @prop()
  created_at: Date;

  @prop()
  updated_at: Date;

  @prop({ default: 0 })
  download_count: number;
}

export const ResourceModel = getModelForClass(Resource);
