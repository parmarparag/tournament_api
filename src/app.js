// app.js
const express = require('express');
const app = express();
const tournamentRoutes = require('./routes/tournamentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

app.use(express.json());

// Tournament and Ticket Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
