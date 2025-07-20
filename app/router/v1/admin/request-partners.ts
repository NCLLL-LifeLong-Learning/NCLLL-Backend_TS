import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { RequestPartnerController } from "~/app/controller/v1/admin/request-partner";

const router = express.Router();
const ctrl = bindCtx(new RequestPartnerController());

router.get("/", ctrl.getAll);
router.patch("/:id/seen", ctrl.markAsSeen);

export default router;
