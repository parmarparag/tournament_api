// routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

router.get('/:tournament_id', ticketController.getTicketsByTournament);
router.post('/purchase', ticketController.purchaseTicket);

module.exports = router;
