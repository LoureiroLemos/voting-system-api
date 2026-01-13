import app from "./app.js";
import "dotenv/config";
import pool from "./config/database.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
