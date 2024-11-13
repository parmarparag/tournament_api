// models/Tournament.js
const db = require('../config/db');

const Tournament = {
  create: (scheduledDatetime, playersCount, ticketPrice, callback) => {
    const query = 'INSERT INTO Tournaments (scheduled_datetime, players_count, ticket_price) VALUES (?, ?, ?)';
    db.query(query, [scheduledDatetime, playersCount, ticketPrice], (err, result) => {
      if (err) return callback(err);
      // Return the inserted tournament_id along with the result
      callback(null, { tournament_id: result.insertId, ...result });
    });
  },
  
  getAll: (callback) => {
    const query = 'SELECT tournament_id, scheduled_datetime, players_count, ticket_price FROM Tournaments';
    db.query(query, callback);
  }
};

module.exports = Tournament;
