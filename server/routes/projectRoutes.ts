import express from "express";
import { protect } from "../middlewares/auth.js";
import {
    makeRevision,
    rollbackToVersion,
    getProjectCode,
    saveProjectCode,
    deleteProject,
    getPublishedProject,
    getAllPublishedProjects
} from "../controllers/projectControllwe.js";

const projectRouter = express.Router();

projectRouter.post("/revision/:projectId", protect, makeRevision);
projectRouter.get("/rollback/:projectId/:versionId", protect, rollbackToVersion);
projectRouter.get("/code/:projectId", protect, getProjectCode);
projectRouter.post("/save/:projectId", protect, saveProjectCode);
projectRouter.delete("/delete/:projectId", protect, deleteProject);
projectRouter.get("/published/:projectId", getPublishedProject);
projectRouter.get("/all", getAllPublishedProjects);

export default projectRouter;