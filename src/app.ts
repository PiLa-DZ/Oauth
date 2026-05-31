import express from "express";
import { globalError } from "./errors/global.error.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

// app.use(express.static("public"));

app.use(globalError);

export default app;
