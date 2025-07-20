import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import {
  CreateAdminPayload,
  EditAdminPayload,
  GetAdminsQuery,
} from "~/app/dto/admin";
import { UserService } from "~/app/service/admin";
import { ok } from "~/common/response";
export class UserController {
  private userService = new UserService();

  async create(req: Request, res: Response) {
    const payload = {
      ...req.body,
      auth: req.admin,
    };
    await this.userService.create(payload);
    return res.send(ok());
  }

  async getAll(req: Request, res: Response) {
    const query = plainToInstance(GetAdminsQuery, req.query);
    const result = await this.userService.paginate(query);
    return res.send(ok(result));
  }

  async update(req: Request, res: Response) {
    const payload = {
      ...req.body,
      auth: req.admin,
    };

    const user = await this.userService.update(payload);
    return res.send(ok(user));
  }
}
