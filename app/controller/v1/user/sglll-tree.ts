import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { SglllTreeService } from "~/app/service/sglll-tree";
import { ok } from "~/common/response";
import { SglllTreeQueryDto } from "~/app/dto/sglll-tree";

export class SglllTreeController {
  private sglllTreeService = new SglllTreeService();

  async getSglllTrees(req: Request, res: Response) {
    const queryDto = plainToInstance(SglllTreeQueryDto, req.query);
    const paginatedResult = await this.sglllTreeService.getAllSglllTrees(
      queryDto
    );
    return res.send(ok(paginatedResult));
  }

  async getByTerm(req: Request, res: Response) {
    const term = parseInt(req.params.term);
    const sglllTree = await this.sglllTreeService.getSglllTreeByTerm(term);
    return res.send(ok(sglllTree));
  }
}
