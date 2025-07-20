import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ok, notFound, unprocessableEntity } from "~/common/response";
import { MemberService } from "~/app/service/gov-member";
import {
  CreateMemberPayload,
  EditMemberPayload,
} from "~/app/dto/govern-member";

export class MemberController {
  private memberService = new MemberService();

  /**
   * Controller: Get all members grouped by position, optionally filtered by generation
   */
  async getAllGroupedMembers(req: Request, res: Response) {
    const generationParam = req.query.generation;
    const generation = generationParam ? Number(generationParam) : undefined;

    const rsp = await this.memberService.getAllGroupedMembers(generation);
    return res.send(ok(rsp));
  }

  /**
   * Get all members
   */
  async getAll(req: Request, res: Response) {
    const populate = req.query.populate !== "false";
    const members = await this.memberService.getAllMembers(populate);
    return res.send(ok(members));
  }

  /**
   * Get member by ID
   */
  async getById(req: Request, res: Response) {
    const id = req.params.id;
    const populate = req.query.populate !== "false";
    const member = await this.memberService.getMemberById(id, populate);
    return res.send(ok(member));
  }
  async getSglllTree(req: Request, res: Response) {
    const tree = await this.memberService.buildMemberTree();
    return res.send(ok(tree));
  }
}
