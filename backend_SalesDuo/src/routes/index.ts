import { Router } from "express";
import runsRoutes from "./runs.routes.js";

const router = Router();

router.use("/runs", runsRoutes);

export default router;