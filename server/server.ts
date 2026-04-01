import express, { Request, Response } from "express";
import 'dotenv/config';
import cors from 'cors';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const port = 3000;
const corsOptions ={
    origin: process.env.TRUSTED_ORIGINS?.split(",") || [],
    credentials:true,
    methods:["GET","POST","PUT","DELETE"],
    allowedHeaders:["Content-Type","Authorization"],
}

app.use(cors(corsOptions));
app.all('/api/auth/*path', toNodeHandler(auth));


app.get("/", (req: Request, res:Response) => {
    res.send("Server is Live!");
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


