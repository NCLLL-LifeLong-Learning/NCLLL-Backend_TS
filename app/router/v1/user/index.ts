import { Router } from "express";

const router = Router();

import BannerRoutes from "./banner";
import TagRoutes from "./tag";
import GavormentRoutes from "./govern-member";
import MinistryRoutes from "./ministry";
import ResourceRoutes from "./resource";
import BlogRoutes from "./blog";
import RequestPartnersRoutes from "./request-partners";
import PartnerRoutes from "./partner";
import FocusAreaRoute from "./focus-area";
import ModuleRoute from "./module";
import WebsiteSettingsRoutes from "./website-settings";
import SglllTreeRoutes from "./sglll-tree";

router
  .use("/settings", WebsiteSettingsRoutes)
  .use("/govern-members", GavormentRoutes)
  .use("/ministries", MinistryRoutes)
  .use("/tags", TagRoutes)
  .use("/banners", BannerRoutes)
  .use("/blogs", BlogRoutes)
  .use("/request-partner", RequestPartnersRoutes)
  .use("/resources", ResourceRoutes)
  .use("/partners", PartnerRoutes)
  .use("/focus-areas", FocusAreaRoute)
  .use("/modules", ModuleRoute)
  .use("/sglll-tree", SglllTreeRoutes);

export default router;
