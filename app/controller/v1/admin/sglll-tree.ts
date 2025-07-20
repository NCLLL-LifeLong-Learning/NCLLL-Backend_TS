import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { SglllTreeService } from "~/app/service/sglll-tree";
import { ok } from "~/common/response";
import {
  CreateSglllTreePayload,
  EditSglllTreePayload,
  SglllTreeQueryDto,
} from "~/app/dto/sglll-tree";

export class SglllTreeController {
  private sglllTreeService = new SglllTreeService();

  async create(req: Request, res: Response) {
    const payload = plainToInstance(CreateSglllTreePayload, req.body);
    const sglllTree = await this.sglllTreeService.createSglllTree(payload);
    return res.send(ok(sglllTree));
  }

  async getSglllTrees(req: Request, res: Response) {
    const queryDto = plainToInstance(SglllTreeQueryDto, req.query);
    const paginatedResult = await this.sglllTreeService.getAllSglllTrees(
      queryDto
    );
    return res.send(ok(paginatedResult));
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const sglllTree = await this.sglllTreeService.getSglllTreeById(id);
    return res.send(ok(sglllTree));
  }

  async getByTerm(req: Request, res: Response) {
    const term = parseInt(req.params.term);
    const sglllTree = await this.sglllTreeService.getSglllTreeByTerm(term);
    return res.send(ok(sglllTree));
  }

  async update(req: Request, res: Response) {
    const payload = plainToInstance(EditSglllTreePayload, req.body);
    const sglllTree = await this.sglllTreeService.updateSglllTree(payload);
    return res.send(ok(sglllTree));
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    const result = await this.sglllTreeService.deleteSglllTree(id);
    return res.send(ok(result));
  }
}
