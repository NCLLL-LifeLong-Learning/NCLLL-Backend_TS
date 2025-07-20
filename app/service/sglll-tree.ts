import { badRequest, notFound } from "~/common/response";
import {
  CreateSglllTreePayload,
  EditSglllTreePayload,
  SglllTreeQueryDto,
} from "../dto/sglll-tree";
import { SglllTreeModel } from "../entity/sglll-tree";
import {
  mongoPaginate,
  MongoPaginationOptions,
} from "~/common/utils/pagination";

export class SglllTreeService {
  async createSglllTree(payload: CreateSglllTreePayload) {
    const { term, image_url_en, image_url_kh } = payload;
    // Check if term already exists
    const existingTree = await SglllTreeModel.findOne({ term: payload.term });
    if (existingTree) {
      throw badRequest(`SglllTree with term ${payload.term} already exists`);
    }

    const sglllTree = await SglllTreeModel.create({
      term,
      image_url_en,
      image_url_kh,
    });

    return sglllTree;
  }

  async getAllSglllTrees(query: SglllTreeQueryDto) {
    const { page = 1, limit = 10, term, keyword } = query;
    const filter: any = {};
    if (term) filter.term = term;
    if (keyword) {
      filter.$or = [
        { term: { $regex: keyword, $options: "i" } },
        { image_url: { $regex: keyword, $options: "i" } },
      ];
    }

    const order_by = "term ASC";
    const allowed_order = ["term", "image_url", "created_at", "_id"];
    const paginationOptions: MongoPaginationOptions = {
      page,
      limit,
      order_by,
      allowed_order,
      filter,
    };
    return await mongoPaginate(SglllTreeModel, paginationOptions);
  }

  async getSglllTreeById(id: string) {
    const sglllTree = await SglllTreeModel.findById(id).lean();
    if (!sglllTree) {
      throw notFound("SglllTree not found");
    }
    return sglllTree;
  }

  async updateSglllTree(payload: EditSglllTreePayload) {
    const { term, image_url_en, image_url_kh, id } = payload;
    // Check if another tree with the same term exists (excluding current one)
    const existingTree = await SglllTreeModel.findOne({
      term: payload.term,
      _id: { $ne: id },
    });
    if (existingTree) {
      throw badRequest(`SglllTree with term ${payload.term} already exists`);
    }

    const sglllTree = await SglllTreeModel.findByIdAndUpdate(
      id,
      {
        term,
        image_url_en,
        image_url_kh,
      },
      { new: true, runValidators: true }
    );

    if (!sglllTree) {
      throw notFound("SglllTree not found");
    }

    return sglllTree;
  }

  async deleteSglllTree(id: string) {
    const sglllTree = await SglllTreeModel.findByIdAndDelete(id);
    if (!sglllTree) {
      throw notFound("SglllTree not found");
    }
    return { message: "SglllTree deleted successfully" };
  }

  async getSglllTreeByTerm(term: number) {
    const sglllTree = await SglllTreeModel.findOne({ term }).lean();
    if (!sglllTree) {
      throw notFound(`SglllTree with term ${term} not found`);
    }
    return sglllTree;
  }
}
