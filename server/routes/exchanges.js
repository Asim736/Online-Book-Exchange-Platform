import express from 'express';
import {
    getAllExchanges,
    getExchangeById,
    createExchange,
    updateExchangeStatus,
    deleteExchange
} from '../controllers/exchangeController.js';

const router = express.Router();

// GET all exchanges
router.get('/', getAllExchanges);

// GET exchange by ID
router.get('/:id', getExchangeById);

// POST new exchange
router.post('/', createExchange);

// UPDATE exchange status
router.put('/:id/status', updateExchangeStatus);

// DELETE exchange
router.delete('/:id', deleteExchange);

export default router;