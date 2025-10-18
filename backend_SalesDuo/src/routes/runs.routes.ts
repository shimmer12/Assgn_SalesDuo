import { Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.js";
import { postRun, getRuns, getRun } from "../controllers/runs.controller.js";

const router = Router();

router.post("/", asyncHandler(postRun));

router.get("/:asin", asyncHandler(getRun));

router.get("/", asyncHandler(getRuns));

export default router;