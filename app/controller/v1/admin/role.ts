import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import {
  CreateAdminPayload,
  EditAdminPayload,
  GetAdminsQuery,
} from "~/app/dto/admin";
import { UserService } from "~/app/service/admin";
import { RoleService } from "~/app/service/role";
import { ok } from "~/common/response";
export class RoleController {
  private roleSvc = new RoleService();
  async getAll(req: Request, res: Response) {
    const result = await this.roleSvc.getAll();
    return res.send(ok(result));
  }

  async seedRoles(req: Request, res: Response) {
    const roles = await this.roleSvc.seedRoles();
    return res.send(ok(roles));
  }
}
