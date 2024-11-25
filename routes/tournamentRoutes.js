const express = require("express");
const router = express.Router();
const tournamentController = require("../controllers/tournamentController");

router.post("/create", tournamentController.createTournament);
router.get("/list", tournamentController.getTournaments);
router.put("/start/:id", tournamentController.startTournament);
router.put("/finish/:id", tournamentController.finishTournament);

module.exports = router;
