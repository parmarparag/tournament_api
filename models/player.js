const db = require("./db");

class Player {
  static async joinTournament(data) {
    const sql = `INSERT INTO players (tournament_id, wallet_address, entry_price) VALUES (?, ?, ?)`;
    await db.execute(sql, [
      data.tournament_id,
      data.wallet_address,
      data.entry_price,
    ]);
  }
}

module.exports = Player;
