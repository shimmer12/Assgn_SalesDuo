import express, { Request, Response } from "express";
import { createServer } from "http";
import app from "./app.js";

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.set("port", port);

const server = createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
