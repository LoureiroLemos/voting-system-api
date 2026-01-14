import { Router } from "express";
import pool from "../config/database.js";
import Controller from "../controllers/poll.controller.js";
import pollController from "../controllers/poll.controller.js";

const router = Router();

// Rota para Criar Enquete (POST)
router.post("/", pollController.create);

// Rota para listar as enquetes (GET)
router.get("/", pollController.findAll);

// Rota para buscar detalhes de uma enquete (GET /:id)
router.get("/:id", pollController.findOne);

// Rota para registrar voto (POST /polls/vote)
router.post("/vote", pollController.findOne);

export default router;
