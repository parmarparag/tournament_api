const mysql = require("mysql2/promise");
const config = require("../config");

const pool = mysql.createPool(config.database);

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database is connected");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error.message);
  }
})();

module.exports = pool;
