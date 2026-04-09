"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const node_1 = require("better-auth/node");
const auth_1 = require("./lib/auth");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const stripeWebhooks_1 = require("./controllers/stripeWebhooks");
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
const app = (0, express_1.default)();
const port = 3000;
const corsOptions = {
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
app.post('/api/stripe', express_1.default.raw({ type: 'application/json' }), stripeWebhooks_1.stripeWebhooks);
// Log all requests to debug connectivity
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/api/auth', (0, node_1.toNodeHandler)(auth_1.auth));
app.use(express_1.default.json({ limit: "50mb" }));
app.get("/", (req, res) => {
    res.send("Server is Live!");
});
app.use("/api/user", userRoutes_1.default);
app.use("/api/project", projectRoutes_1.default);
app.use("/api/project", projectRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
