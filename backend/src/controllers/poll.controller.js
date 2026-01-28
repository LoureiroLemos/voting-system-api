import pool from "../config/database.js";

class Controller {
  async create(req, res) {
    const { title, start_date, end_date, options } = req.body;

    if (!title || !start_date || !end_date || !options) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios.",
      });
    }

    const finalStartDate = `${start_date} 00:00:00`;
    const finalEndDate = `${end_date} 23:59:59`;

    if (new Date(finalStartDate) >= new Date(finalEndDate)) {
      return res.status(400).json({
        error: "A data de término deve ser posterior à data de inicio.",
      });
    }

    try {
      const [result] = await pool.execute(
        "INSERT INTO polls (title, start_date, end_date) VALUES (?, ?, ?)",
        [title, finalStartDate, finalEndDate],
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
      const dateQuery = `
        SELECT p.start_date, p.end_date
        FROM polls p
        JOIN poll_options po ON p.id = po.poll_id
        where po.id = ?
      `;

      const [pollData] = await pool.execute(dateQuery, [optionId]);

      if (pollData.length === 0) {
        return res.status(404).json({ error: "Opção não encontrada." });
      }

      const now = new Date();
      const start = new Date(pollData[0].start_date);
      const end = new Date(pollData[0].end_date);

      if (now < start) {
        return res.status(400).json({ error: "A enquete ainda não começou." });
      }

      if (now > end) {
        return res.status(400).json({ error: "A enquete já foi encerrada." });
      }

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
