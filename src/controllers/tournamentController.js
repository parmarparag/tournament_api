// controllers/tournamentController.js
const Tournament = require('../models/Tournament');
const Ticket = require('../models/Ticket');

exports.createTournament = (req, res) => {
  const { scheduled_datetime, players_count, ticket_price } = req.body;
  
  Tournament.create(scheduled_datetime, players_count, ticket_price, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    const tournamentId = result.insertId;
    const tickets = Array.from({ length: players_count }, (_, i) => [tournamentId, `T${i + 1}`, false, null, ticket_price]);
    
    Ticket.createBatch(tickets, (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      
      res.json({
        success: true,
        message: 'Tournament created and tickets generated successfully.',
        tournament_id: tournamentId
      });
    });
  });
};

exports.getAllTournaments = (req, res) => {
  Tournament.getAll((err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    res.json({ success: true, tournaments: results });
  });
};
