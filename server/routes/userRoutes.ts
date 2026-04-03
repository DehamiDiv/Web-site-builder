import express from "express";
import { protect } from "../middlewares/auth.js";
import { getUserCredits, createNewProject, purchaseCredits, getUserProject, togglePublish, getUserProjects } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/credits", protect, getUserCredits);
userRouter.post("/project", protect, createNewProject);
userRouter.post("/project/:projectId", protect, getUserProject);
userRouter.post("/projects", protect, getUserProjects);
userRouter.post("/purchase-toggle/:projectId", protect, togglePublish);
userRouter.post("/purchase-credits", protect, purchaseCredits);

export default userRouter;