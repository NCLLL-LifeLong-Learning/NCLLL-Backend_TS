import { Types } from "mongoose";
import { notFound } from "~/common/response";
import { Member, MemberModel, PositionModel } from "../entity/gov-board-member";
import { CreateMemberPayload, EditMemberPayload } from "../dto/govern-member";
import { Ref } from "@typegoose/typegoose";

export class MemberService {
  /**
   * Create a new member
   * @param payload Member creation data
   * @returns Newly created member
   */
  async createMember(payload: CreateMemberPayload) {
    const positionExists = await PositionModel.exists({
      _id: payload.position,
    });

    if (!positionExists) {
      throw notFound("Position not found");
    }

    if (payload.parent) {
      const parent = await MemberModel.findOne({ _id: payload.parent });
      if (!parent) {
        throw notFound("Parent member not found");
      }
    }

    const member = await MemberModel.create({
      en: payload.en,
      kh: payload.kh,
      parent: payload.parent,
      position: payload.position,
      created_at: new Date(),
      updated_at: new Date(),
      generation: payload.generation,
    });

    return await member.populate("position");
  }

  /**
   * Get all active members with optional population
   * @param populate Whether to populate the position reference
   * @returns Array of members
   */
  async getAllMembers(populate = true) {
    const query = MemberModel.find({ deleted_at: null });

    if (populate) {
      query.populate(["position", "parent"]);
    }

    return await query.sort({ created_at: -1 }).exec();
  }

  /**
   * Get all active members with only mandatory keys & grouped by position
   * @param generation The selected generation number (optional)
   * @returns Object containing: 
   *   - grouped member list by position
   *   - all available generations
   *   - the current (latest) generation
   */
  async getAllGroupedMembers(generation: Number | undefined) {
    const groupGeneration = await MemberModel.aggregate([
      { $group: { _id: "$generation" } },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          generations: { $push: "$_id" },
        }
      },
      {
        $project: {
          generations: 1,
          currentGeneration: { $max: "$generations" }
        }
      }
    ])

    let query: Record<string, any> = { deleted_at: null };

    if (generation) {
      query.generation = generation;
    } else if (groupGeneration && groupGeneration.length > 0) {
      query.generation = groupGeneration[0]?.currentGeneration;
    } else {
      return { list: [], generations: [], currentGeneration: 0 };
    }

    const result = await MemberModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$position",
          members: {
            $push: {
              _id: "$_id",
              name_en: "$en.name",
              name_kh: "$kh.name",
              imageUrl_en: "$en.imageUrl",
              imageUrl_kh: "$kh.imageUrl",
            },
          },
        },
      },
      {
        $lookup: {
          from: "positions",
          localField: "_id",
          foreignField: "_id",
          as: "position",
        },
      },
      { $unwind: { path: "$position" } },
      { $sort: { "position.en.level": 1 } },
    ]);

    return {
      list: result,
      generations: groupGeneration[0]?.generations ?? 0,
      currentGeneration: groupGeneration[0]?.currentGeneration ?? null
    };
  }

  /**
   * Get a member by ID
   * @param id Member ID
   * @param populate Whether to populate the position reference
   * @returns Member document
   */
  async getMemberById(id: string, populate = true) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }

    const query = MemberModel.findOne({
      _id: id,
      deleted_at: null,
    });

    if (populate) {
      query.populate(["position", "parent"]);
    }

    const member = await query.exec();

    if (!member) {
      throw notFound("Member not found");
    }

    return member;
  }

  /**
   * Update a member by ID
   * @param payload Member update data with ID
   * @returns Updated member
   */
  async updateMember(payload: EditMemberPayload) {
    const { id, position, ...updateData } = payload;

    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }

    // Verify member exists
    const member = await MemberModel.findOne({
      _id: id,
      deleted_at: null,
    });

    if (!member) {
      throw notFound("Member not found");
    }

    // If position is being updated, verify it exists
    if (position && position !== member.position.toString()) {
      const positionExists = await PositionModel.exists({ _id: position });
      if (!positionExists) {
        throw notFound("Position not found");
      }
      member.position = position as any;
    }

    if (payload.parent) {
      const parent = await MemberModel.findOne({ _id: updateData.parent });
      if (!parent) {
        throw notFound("Parent not found");
      }
      member.parent = new Types.ObjectId(
        updateData.parent
      ) as unknown as Ref<Member>;
    }

    // Update member info
    if (updateData.en) {
      member.en = {
        ...(member.en as any),
        ...updateData.en,
      };
    }

    if (updateData.kh) {
      member.kh = {
        ...(member.kh as any),
        ...updateData.kh,
      };
    }

    return await member.save().then((m) => m.populate(["position", "parent"]));
  }

  /**
   * Delete a member by ID
   * @param id Member ID
   * @returns Deleted member
   */
  async deleteMember(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw notFound("Invalid member ID format");
    }
    await MemberModel.findByIdAndDelete(id);
  }
  /**
   * Build a hierarchical tree of members starting from a root member
   * @param rootMemberId ID of the root member, or null for top-level members
   * @returns Hierarchical structure of members
   */
  async buildMemberTree(rootMemberId: number | null = null) {
    const pipeline = [
      {
        $match: {
          deleted_at: { $exists: false },
        },
      },
      {
        $addFields: {
          isRoot: {
            $cond: {
              if: { $eq: [rootMemberId, null] },
              then: { $eq: ["$parent", null] },
              else: { $eq: ["$parent", rootMemberId] },
            },
          },
        },
      },
      {
        $lookup: {
          from: "positions",
          localField: "position",
          foreignField: "_id",
          as: "positionInfo",
        },
      },
      {
        $unwind: {
          path: "$positionInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $graphLookup: {
          from: "members",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parent",
          as: "descendants",
          maxDepth: 10,
          depthField: "level",
          restrictSearchWithMatch: {
            deleted_at: { $exists: false },
          },
        },
      },
      {
        $match: {
          isRoot: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: "$en.name",
          position: "$positionInfo.name",
          generation: 1,
          created_at: 1,
          updated_at: 1,
          descendants: 1,
        },
      },
    ];

    return await MemberModel.aggregate(pipeline);
  }
}
