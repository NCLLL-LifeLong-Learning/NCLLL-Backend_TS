import { RoleModel } from "../entity/role";

export class RoleService {
  async getAll() {
    return await RoleModel.find({ code: { $ne: "admin" } }).sort({
      createdAt: -1,
    });
  }
  async seedRoles() {
    const roles = [
      { name: "Administrator", code: "admin" },
      { name: "Content Editor", code: "editor" },
      { name: "Content Viewer", code: "viewer" },
    ];

    const existingRoles = await RoleModel.find({
      name: { $in: roles.map((r) => r.name) },
    });
    const existingRoleNames = existingRoles.map((role) => role.name);

    const newRoles = roles.filter(
      (role) => !existingRoleNames.includes(role.name)
    );

    if (newRoles.length > 0) {
      await RoleModel.insertMany(newRoles);
    }

    return await RoleModel.find();
  }
}
