import { prop } from "@typegoose/typegoose";

export class FileObject {
  @prop({ required: true })
  file_name: string;

  @prop({ required: true })
  url: string;

  @prop({ required: true, type: Number })
  size: number;

  @prop({ default: 0 })
  download_count: number;
}
