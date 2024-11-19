const db = require('./db');

class Tournament {
    static async create(data) {
        const sql = `INSERT INTO tournaments (entry_price, speed_level, num_races, map_name, room_code, creator_wallet_address, status) 
                        VALUES (?, ?, ?, ?, ?, ?, 'pending')`;
        const [result] = await db.execute(sql, [
            data.entry_price,
            parseFloat(data.speed_level),  // Ensure speed_level is treated as a decimal
            data.num_races,
            data.map_name,
            data.room_code,
            data.creator_wallet_address
        ]);
        return result.insertId;
    }

  static async findAll() {
    const sql = 'SELECT * FROM tournaments WHERE status = "pending" OR status = "ongoing"';
    const [rows] = await db.execute(sql);
    return rows;
  }

  static async startTournament(id) {
    const sql = `UPDATE tournaments SET status = 'ongoing' WHERE id = ?`;
    await db.execute(sql, [id]);
  }

  static async finishTournament(id) {
    const sql = `UPDATE tournaments SET status = 'completed' WHERE id = ?`;
    await db.execute(sql, [id]);
  }
}

module.exports = Tournament;
