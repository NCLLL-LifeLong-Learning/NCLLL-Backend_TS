import express from "express";
import { bindCtx } from "~/common/utils/bind";
import { WebsiteSettingsController } from "~/app/controller/v1/admin/website-settings";

const router = express.Router();
const ctrl = bindCtx(new WebsiteSettingsController());

router.get("/", ctrl.getOne);
router.post("/maintenance-key/verify", ctrl.verifyMaintenanceKey);

export default router;
