const Player = require("../models/player");
const responseHandler = require("../utils/responseHandler");

exports.joinTournament = async (req, res) => {
  try {
    await Player.joinTournament(req.body);
    responseHandler.success(res, null, "Successfully joined tournament");
  } catch (error) {
    responseHandler.error(res, "Failed to join tournament", error);
  }
};
