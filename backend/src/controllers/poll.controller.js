import pool from "../config/database.js";

class Controller {
  async create(req, res) {
    const { title, start_date, end_date, options } = req.body;

    if (!title || !start_date || !end_date || !options) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios.",
      });
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        error: "A data de término deve ser posterior à data de inicio.",
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

      res.status(201).json({
        message: "Enquete criada com sucesso!",
        pollId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Erro ao criar enquete.",
      });
    }
  }

  async findAll(req, res) {
    try {
      const query = `
            SELECT id, title, start_date, end_date,
            CASE
                WHEN NOW() < start_date THEN 'Não iniciada'
                WHEN NOW() > end_date THEN 'Finalizada'
                ELSE 'Em andamento'
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
  }

  async findOne(req, res) {
    const { id } = req.params;
    try {
      const queryPoll = `
            SELECT id, title, start_date, end_date,
            CASE
                WHEN NOW() < start_date then 'Não iniciada'
                WHEN NOW() > end_date then 'Finalizada'
                ELSE 'Em andamento'
            END AS status
            FROM polls WHERE id = ?
            `;
      const [pollResult] = await pool.execute(queryPoll, [id]);

      if (pollResult.length === 0) {
        return res.status(404).json({
          error: "Enquete não encontrada.",
        });
      }

      const poll = pollResult[0];
      const queryOptions =
        "SELECT id, option_text, votes FROM poll_options WHERE poll_id = ?";
      const [optionsResult] = await pool.execute(queryOptions, [id]);

      poll.options = optionsResult;
      res.json(poll);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Erro ao buscar detalhes da enquete.",
      });
    }
  }

  async vote(req, res) {
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({
        error: "O Id da opção é obrigatório",
      });
    }

    try {
      const query = "UPDATE poll_options SET votes = votes + 1 WHERE id = ?";
      const [result] = await pool.execute(query, [optionId]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: "Opção de voto não encontrada.",
        });
      }

      req.io.emit("new_vote", { optionId: Number(optionId) });

      res.json({
        message: "Voto registrado com sucesso!",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Erro ao registrar voto.",
      });
    }
  }
}

export default new Controller();
