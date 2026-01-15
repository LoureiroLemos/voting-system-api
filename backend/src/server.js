import { createServer, METHODS } from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import "dotenv/config";
import pool from "./config/database.js";
import routes from "./routes/index.js";

const PORT = 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(routes);

io.on("connection", (socket) => {
  console.log("Cliente conectado via WebSocket:", socket.id);
});

httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} e pronto para WebSocket`);
});
