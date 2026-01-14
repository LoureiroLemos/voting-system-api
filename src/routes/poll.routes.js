import { Router } from "express";
import pool from "../config/database.js";

const router = Router();

// Rota para Criar Enquete (POST)
router.post("/", async (req, res) => {
  const { title, start_date, end_date, options } = req.body;

  if (!title || !start_date || !end_date || !options) {
    return res.status(400).json({
      error: "Todos os campos são obrigatórios.",
    });
  }

  if (!Array.isArray(options) || options.length < 3) {
    return res.status(400).json({
      error: "A enquete deve ter no mínimo 3 opções de resposta.",
    });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO polls (title, start_date, end_date) VALUES (?, ?, ?)",
      [title, start_date, end_date]
    );

    const pollId = result.insertId;

    const optionsData = options.map((optionText) => [pollId, optionText]);

    const placeholders = optionsData.map(() => "(?, ?)").join(", ");

    const sqlOptions = `INSERT INTO poll_options (poll_id, option_text) VALUES ${placeholders}`;

    const flatParams = optionsData.flat();

    await pool.execute(sqlOptions, flatParams);

    res.status(200).json({
      message: "Enquete criada com sucesso!",
      pollId: pollId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Erro ao criar enquete.",
    });
  }
});

// Rota para listar as enquetes (GET)
router.get("/", async (req, res) => {
  try {
    const query = `
    SELECT id, title, start_date, end_date,
    CASE
      WHEN NOW() < start_date THEN 'Não iniciada'
      WHEN NOW() > end_date THEN 'Finalizada'
      ELSE 'Em Andamento'
    END AS status
    FROM polls
    `;

    const [rows] = await pool.execute(query);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erro ao buscar enquetes.",
    });
  }
});

// Rota para buscar detalhes de uma enquete (GET /:id)
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const queryPoll = `
    SELECT id, start_date, end_date,
    CASE
      WHEN NOW() < start_date THEN 'Não iniciada'
      WHEN NOW() > end_date THEN 'Finalizada'
      ELSE 'Em andamento'
    END AS status
    FROM POLLS
    WHERE id = ?
    `;

    const [pollResult] = await pool.execute(queryPoll, [id]);

    if (pollResult.length === 0) {
      return res.status(404).json({
        error: "Enquete não encontrada.",
      });
    }

    const poll = pollResult[0];

    const queryOptions = `
    SELECT id, option_text, votes
    FROM poll_options
    WHERE poll_id = ?
    `;

    const [optionsResult] = await pool.execute(queryOptions, [id]);

    poll.options = optionsResult;

    res.json(poll);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Erro ao buscar detalhes da enquete.",
    });
  }
});

export default router;
