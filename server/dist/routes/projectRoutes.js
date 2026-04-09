"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../middlewares/auth.js");
const projectControllwe_js_1 = require("../controllers/projectControllwe.js");
const projectRouter = express_1.default.Router();
projectRouter.post("/revision/:projectId", auth_js_1.protect, projectControllwe_js_1.makeRevision);
projectRouter.get("/rollback/:projectId/:versionId", auth_js_1.protect, projectControllwe_js_1.rollbackToVersion);
projectRouter.get("/code/:projectId", auth_js_1.protect, projectControllwe_js_1.getProjectCode);
projectRouter.post("/save/:projectId", auth_js_1.protect, projectControllwe_js_1.saveProjectCode);
projectRouter.delete("/delete/:projectId", auth_js_1.protect, projectControllwe_js_1.deleteProject);
projectRouter.get("/published/:projectId", projectControllwe_js_1.getPublishedProject);
exports.default = projectRouter;
