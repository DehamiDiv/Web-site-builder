import { fromNodeHeaders } from "better-auth/node";
import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
        })
        if(!session){
            return res.status(401).json({ error: "Unauthorized user" });
        }
        req.userId = session.user.id;
        next();
    } catch (error) {
        console.error("Error protecting route:", error);
        res.status(500).json({ error: "Failed to protect route" });
    }
};