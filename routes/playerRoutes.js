const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.post('/join', playerController.joinTournament);

module.exports = router;
