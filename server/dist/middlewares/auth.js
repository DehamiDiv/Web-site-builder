"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const node_1 = require("better-auth/node");
const auth_js_1 = require("../lib/auth.js");
const protect = async (req, res, next) => {
    try {
        const session = await auth_js_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers)
        });
        if (!session) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        req.userId = session.user.id;
        next();
    }
    catch (error) {
        console.error("Error protecting route:", error);
        res.status(500).json({ error: "Failed to protect route" });
    }
};
exports.protect = protect;
