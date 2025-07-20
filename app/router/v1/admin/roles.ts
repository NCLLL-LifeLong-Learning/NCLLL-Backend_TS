import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { RoleController } from "~/app/controller/v1/admin/role";

const router = express.Router();
const ctrl = bindCtx(new RoleController());

router.get("/", ctrl.getAll);
router.post("/seed", ctrl.seedRoles);

export default router;
