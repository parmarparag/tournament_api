const express = require("express");
const tournamentRoutes = require("./routes/tournamentRoutes");
const playerRoutes = require("./routes/playerRoutes");

const app = express();
app.use(express.json());

app.use("/api/tournaments", tournamentRoutes);
app.use("/api/players", playerRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
