import { prop, getModelForClass, index } from "@typegoose/typegoose";

@index({ title: 1, lang: 1 })
class SglllTree {
  @prop()
  term: number;

  @prop()
  image_url_en: string;

  @prop()
  image_url_kh: string;
}

export const SglllTreeModel = getModelForClass(SglllTree);
