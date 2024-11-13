// controllers/ticketController.js
const Ticket = require('../models/Ticket');

exports.getTicketsByTournament = (req, res) => {
  const { tournament_id } = req.params;
  
  Ticket.getByTournamentId(tournament_id, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    res.json({ success: true, tickets: results });
  });
};

exports.purchaseTicket = (req, res) => {
  const { ticket_id, wallet_address } = req.body;
  
  Ticket.purchase(ticket_id, wallet_address, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    
    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'Ticket is already sold or does not exist.' });
    }
    
    res.json({ success: true, message: 'Ticket purchased successfully.' });
  });
};
