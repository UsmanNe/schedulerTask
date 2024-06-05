import express from 'express';
import logService from '../controllers/log-service.js';

const router = express.Router();

router.get('/', logService);

export default router;
