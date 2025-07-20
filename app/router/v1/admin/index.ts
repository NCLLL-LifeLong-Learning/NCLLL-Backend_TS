import express from "express";

import AuthRoutes from "./auth";
import Position from "./position";
import MemberRoutes from "./govern-member";
import SponssorRoutes from "./sponsor";
import BannerRoutes from "./banner";
import TagRoutes from "./tag";
import MinistryRoutes from "./ministry";
import UploadRoutes from "./file";
import ResoureceRoutes from "./resource";
import BlogRoutes from "./blog";
import PartnerRoutes from "./partner";
import FocusAreaRoutes from "./focus-area";
import ModuleRoutes from "./module";
import WebsiteSettingsRoutes from "./website-settings";
import SglllTreeRoutes from "./sglll-tree";
import RequestPartnersRoutes from "./request-partners";
import AdminRoutes from "./admin";
import RoleRoutes from "./roles";
const router = express.Router();

router
  .use("/settings", WebsiteSettingsRoutes)
  .use("/auth", AuthRoutes)
  .use("/position", Position)
  .use("/member", MemberRoutes)
  .use("/sponsor", SponssorRoutes)
  .use("/banner", BannerRoutes)
  .use("/tag", TagRoutes)
  .use("/ministry", MinistryRoutes)
  .use("/upload", UploadRoutes)
  .use("/resource", ResoureceRoutes)
  .use("/blog", BlogRoutes)
  .use("/partner", PartnerRoutes)
  .use("/focus-area", FocusAreaRoutes)
  .use("/modules", ModuleRoutes)
  .use("/sglll-tree", SglllTreeRoutes)
  .use("/request-partner", RequestPartnersRoutes)
  .use("/admin", AdminRoutes)
  .use("/role", RoleRoutes);

export default router;
