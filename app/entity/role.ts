import { prop, getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";

export class Role {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  code!: string;
}

export const RoleModel = getModelForClass(Role);
