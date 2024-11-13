// models/Ticket.js
const db = require('../config/db');

const Ticket = {
  createBatch: (tickets, callback) => {
    const query = 'INSERT INTO Tickets (tournament_id, ticket_name, is_sold, sold_to_wallet, price) VALUES ?';
    db.query(query, [tickets], callback);
  },
  
  getByTournamentId: (tournamentId, callback) => {
    const query = 'SELECT ticket_id, ticket_name, is_sold, price FROM Tickets WHERE tournament_id = ?';
    db.query(query, [tournamentId], callback);
  },
  
  purchase: (ticketId, walletAddress, callback) => {
    const query = 'UPDATE Tickets SET is_sold = true, sold_to_wallet = ? WHERE ticket_id = ? AND is_sold = false';
    db.query(query, [walletAddress, ticketId], callback);
  }
};

module.exports = Ticket;
