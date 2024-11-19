const Tournament = require('../models/tournament');
const Player = require('../models/player');
const responseHandler = require('../utils/responseHandler');

exports.createTournament = async (req, res) => {
    try {
      const tournamentData = {
        ...req.body,
        speed_level: parseFloat(req.body.speed_level)  // Parse speed_level as a float
      };
      const id = await Tournament.create(tournamentData);
      responseHandler.success(res, { tournamentId: id }, 'Tournament created successfully');
    } catch (error) {
      responseHandler.error(res, 'Failed to create tournament', error);
    }
  };

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.findAll();
    responseHandler.success(res, tournaments);
  } catch (error) {
    responseHandler.error(res, 'Failed to retrieve tournaments', error);
  }
};

exports.startTournament = async (req, res) => {
  try {
    await Tournament.startTournament(req.params.id);
    responseHandler.success(res, null, 'Tournament started');
  } catch (error) {
    responseHandler.error(res, 'Failed to start tournament', error);
  }
};

exports.finishTournament = async (req, res) => {
  try {
    await Tournament.finishTournament(req.params.id);
    responseHandler.success(res, null, 'Tournament finished');
  } catch (error) {
    responseHandler.error(res, 'Failed to finish tournament', error);
  }
};
