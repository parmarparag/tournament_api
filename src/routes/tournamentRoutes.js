// routes/tournamentRoutes.js
const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');

router.post('/create', tournamentController.createTournament);
router.get('/', tournamentController.getAllTournaments);

module.exports = router;
