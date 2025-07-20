import { prop, getModelForClass, Ref } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Role } from "./role";

export class Admin {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  @prop({ ref: () => Role }) role: Ref<Role>;

  @prop({ required: true })
  is_active: boolean = true;

  @prop()
  is_super: boolean = false;

  @prop({ ref: () => Admin }) created_by: Ref<Admin>;
}

export const AdminModel = getModelForClass(Admin);
