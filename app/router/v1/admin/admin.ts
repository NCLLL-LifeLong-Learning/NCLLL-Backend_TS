import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { vbody, vquery } from "~/common/middleware/validator";
import { UserController } from "~/app/controller/v1/admin/admin";
import {
  CreateAdminPayload,
  EditAdminPayload,
  GetAdminsQuery,
} from "~/app/dto/admin";

const router = express.Router();
const ctrl = bindCtx(new UserController());

router
  .post("/", vbody(CreateAdminPayload), ctrl.create)
  .get("/", vquery(GetAdminsQuery), ctrl.getAll)
  .patch("/", vbody(EditAdminPayload), ctrl.update);

export default router;
