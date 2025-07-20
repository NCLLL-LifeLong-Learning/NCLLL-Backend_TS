import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { QueryRequestPartnerDTO } from "~/app/dto/request-partner";
import { RequestPartnerService } from "~/app/service/request-partner";
import { ok } from "~/common/response";

export class RequestPartnerController {
  private services = new RequestPartnerService();
  async getAll(req: Request, res: Response) {
    const query = plainToInstance(QueryRequestPartnerDTO, req.query);
    const rsp = await this.services.getAll(query);
    return res.send(ok(rsp));
  }

  async markAsSeen(req: Request, res: Response) {
    const { id } = req.params;
    const rsp = await this.services.markAsSeen(id);
    return res.send(ok(rsp));
  }
}
