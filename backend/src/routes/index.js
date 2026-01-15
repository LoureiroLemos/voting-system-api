import { Router } from 'express';
import pollRoutes from './poll.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: "ok",
  });
});

router.use('/polls', pollRoutes);

export default router;
