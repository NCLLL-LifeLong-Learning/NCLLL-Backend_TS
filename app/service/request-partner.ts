import { notFound } from "~/common/response";
import {
  CreateRequestPartnerDTO,
  QueryRequestPartnerDTO,
} from "../dto/request-partner";
import { RequestPartnersModel } from "../entity/request-partners";
import {
  mongoPaginate,
  MongoPaginationOptions,
} from "~/common/utils/pagination";

export class RequestPartnerService {
  /**
   * Create a new ministry
   * @param payload Ministry creation data
   * @returns Newly created ministry
   */
  async create(payload: CreateRequestPartnerDTO) {
    return await RequestPartnersModel.create({
      status: "pending",
      email: payload.email,
      reason: payload.reason,
      description: payload.description,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Get all partners
   * @returns All partners
   */
  async getAll(request: QueryRequestPartnerDTO) {
    const { status, search, page = 1, limit = 10 } = request;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    const order_by = "created_at DESC";
    const allowed_order = ["created_at", "_id", "status", "email"];
    const paginationOptions: MongoPaginationOptions = {
      page,
      limit,
      order_by,
      allowed_order,
      filter,
    };
    return await mongoPaginate(RequestPartnersModel, paginationOptions);
  }

  /**
   *  Mark as seen
   * @param id Partner ID
   * @returns Updated partner
   */
  async markAsSeen(id: string) {
    const partner = await RequestPartnersModel.findById(id);
    if (!partner) {
      throw notFound("Partner not found");
    }
    partner.status = "seen";
    partner.updated_at = new Date();
    return await partner.save();
  }
}
