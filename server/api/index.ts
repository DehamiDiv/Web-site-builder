import express, { Request, Response } from "express";
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "../lib/auth";
import userRouter from "../routes/userRoutes";
import projectRouter from "../routes/projectRoutes";
import { stripeWebhooks } from "../controllers/stripeWebhooks";

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export const app = express();

const corsOptions ={
    origin: function(origin: any, callback: any) {
        callback(null, true);
    },
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
}

app.use(cors(corsOptions));
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Log all requests to debug connectivity
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use('/api/auth', toNodeHandler(auth));

app.use(express.json({limit:"50mb"}))

app.get("/", (req: Request, res:Response) => {
    res.json({
        status: "Server is Live!",
        env: process.env.NODE_ENV,
        database_url_set: !!process.env.DATABASE_URL,
        auth_url_set: !!process.env.BETTER_AUTH_URL
    });
});
app.use("/api/user", userRouter);
app.use("/api/project", projectRouter);

export default app;
