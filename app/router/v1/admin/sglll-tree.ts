import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody, vquery } from "~/common/middleware/validator";
import { SglllTreeController } from "~/app/controller/v1/admin/sglll-tree";
import {
  CreateSglllTreePayload,
  SglllTreeQueryDto,
} from "~/app/dto/sglll-tree";

const router = express.Router();
const ctrl = bindCtx(new SglllTreeController());

router.get("/", vquery(SglllTreeQueryDto), ctrl.getSglllTrees);
router.get("/:id", ctrl.getById);
router.get("/term/:term", ctrl.getByTerm);
router.post("/", vbody(CreateSglllTreePayload), ctrl.create);
router.patch("/", vbody(CreateSglllTreePayload), ctrl.update);
router.delete("/:id", ctrl.delete);

export default router;
