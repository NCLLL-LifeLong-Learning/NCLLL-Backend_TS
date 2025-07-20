import { notFound, unprocessableEntity } from "~/common/response";
import {
  CreateAdminPayload,
  EditAdminPayload,
  GetAdminsQuery,
} from "../dto/admin";
import {
  mongoPaginate,
  MongoPaginationOptions,
} from "~/common/utils/pagination";
import { FilterQuery } from "mongoose";
import { AdminModel } from "../entity/admin";
import { encrypt } from "~/common/helper/hash";
import { RoleModel } from "../entity/role";

export class UserService {
  async create(payload: CreateAdminPayload) {
    // Check for existing user by email OR name (more flexible)
    const existingAdmin = await AdminModel.findOne({
      $or: [{ email: payload.email }, { name: payload.name }],
    });

    const role = await RoleModel.findById(payload.role);
    if (!role) {
      throw notFound("message.role_not_found");
    }

    if (role.code === "admin") {
      throw unprocessableEntity("message.admin_role_not_allowed");
    }

    if (existingAdmin) {
      throw unprocessableEntity("message.user_already_exists");
    }

    const admin = await AdminModel.create({
      name: payload.name,
      email: payload.email,
      password: encrypt(payload.password),
      is_active: payload.is_active ?? true, // Default to true if not provided
      auth: payload.auth,
      role: payload.role,
    });

    return admin;
  }

  async paginate(query: GetAdminsQuery) {
    const { search, is_active, page, limit } = query;
    const filter: FilterQuery<any> = {};

    if (search?.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (is_active !== undefined) {
      filter.is_active = is_active;
    }
    const paginationOptions: MongoPaginationOptions = {
      page: page || 1,
      limit: limit || 10,
      filter,
      select: "-password",
      populate: { path: "role", select: "code" },
    };

    return await mongoPaginate(AdminModel, paginationOptions);
  }

  async findById(id: string) {
    if (!id) {
      throw unprocessableEntity("message.invalid_id");
    }

    const admin = await AdminModel.findById(id).populate("role");
    if (!admin) {
      throw notFound("message.user_not_found");
    }

    return admin;
  }

  async update(payload: EditAdminPayload) {
    const { id, ...updateData } = payload;

    console.log("Update Data:", updateData);
    if (!id) {
      throw unprocessableEntity("message.invalid_id");
    }

    // Check if updating email/name conflicts with existing users
    if (updateData.email || updateData.name) {
      const conflictFilter: FilterQuery<any> = {
        _id: { $ne: id },
        $or: [] as any[],
      };

      if (updateData.email) {
        (conflictFilter.$or as any[]).push({ email: updateData.email });
      }
      if (updateData.name) {
        (conflictFilter.$or as any[]).push({ name: updateData.name });
      }

      const existingAdmin = await AdminModel.findOne(conflictFilter);
      if (existingAdmin) {
        throw unprocessableEntity("message.user_already_exists");
      }
    }

    const admin = await AdminModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("role");

    const role = await RoleModel.findById(payload.role);
    if (!role) {
      throw notFound("message.role_not_found");
    }

    if (role.code === "admin") {
      throw unprocessableEntity("message.admin_role_not_allowed");
    }

    if (!admin) {
      throw notFound("message.user_not_found");
    }

    return admin;
  }

  async toggleActive(id: string) {
    if (!id) {
      throw unprocessableEntity("message.invalid_id");
    }

    const admin = await AdminModel.findById(id);
    if (!admin) {
      throw notFound("message.user_not_found");
    }

    admin.is_active = !admin.is_active;
    return await admin.save();
  }
}
