const Tournament = require("../models/tournament");
const responseHandler = require("../utils/responseHandler");
const bs58 = require("bs58");
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  clusterApiUrl,
} = require("@solana/web3.js");
const SOLANA_CLUSTER = clusterApiUrl("devnet");
const connection = new Connection(SOLANA_CLUSTER);

exports.createTournament = async (req, res) => {
  try {
    const tournamentData = {
      ...req.body,
      speed_level: parseFloat(req.body.speed_level), // Parse speed_level as a float
    };
    const id = await Tournament.create(tournamentData);
    responseHandler.success(
      res,
      { tournamentId: id },
      "Tournament created successfully"
    );
  } catch (error) {
    responseHandler.error(res, "Failed to create tournament", error);
  }
};

exports.getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.findAll();
    responseHandler.success(res, tournaments);
  } catch (error) {
    responseHandler.error(res, "Failed to retrieve tournaments", error);
  }
};

exports.startTournament = async (req, res) => {
  try {
    await Tournament.startTournament(req.params.id);
    responseHandler.success(res, null, "Tournament started");
  } catch (error) {
    responseHandler.error(res, "Failed to start tournament", error);
  }
};

exports.finishTournament = async (req, res) => {
  try {
    const { first_wallet, second_wallet, third_wallet, tournament_id } =
      req.body;

    // 1. Fetch tournament details
    const tournament = await Tournament.getTournamentDetails(tournament_id);
    if (!tournament) {
      return responseHandler.error(res, "Tournament not found");
    }

    const { entry_price, creator_wallet_address } = tournament;

    // 2. Fetch players
    const players = await Tournament.getPlayers(tournament_id);
    if (players.length === 0) {
      return responseHandler.error(res, "No players found in this tournament");
    }

    // 3. Calculate total prize, creator commission, and shares
    const totalPrize = players.length * entry_price;
    const creatorCommission = 0.05; // 5% commission
    const creatorShare = totalPrize * creatorCommission;
    const prizePool = totalPrize - creatorShare;

    const firstPrize = prizePool * 0.5;
    const secondPrize = prizePool * 0.3;
    const thirdPrize = prizePool * 0.2;

    // 4. Set up Solana transactions
    const creatorPublicKey = new PublicKey(creator_wallet_address);
    const firstWinnerPublicKey = new PublicKey(first_wallet);
    const secondWinnerPublicKey = new PublicKey(second_wallet);
    const thirdWinnerPublicKey = new PublicKey(third_wallet);

    // Use a keypair for the tournament fund wallet
    const privateKeyBase58 =
      "j6i4zsGxREWNEZYYGEDLvWWzecgviTk4wbSSqjtRqPJCm7ZwwzHrh6E4DGLr2fjqmNdPtbcy2NmNJ2FpV3UhBbX";
    const tournamentPrivateKey = bs58.decode(privateKeyBase58);

    const tournamentKeypair = Keypair.fromSecretKey(tournamentPrivateKey);

    // Prepare transactions
    const transactions = [
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: tournamentKeypair.publicKey,
          toPubkey: creatorPublicKey,
          lamports: Math.round(creatorShare * 1e9), // Convert SOL to lamports
        })
      ),
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: tournamentKeypair.publicKey,
          toPubkey: firstWinnerPublicKey,
          lamports: Math.round(firstPrize * 1e9),
        })
      ),
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: tournamentKeypair.publicKey,
          toPubkey: secondWinnerPublicKey,
          lamports: Math.round(secondPrize * 1e9),
        })
      ),
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: tournamentKeypair.publicKey,
          toPubkey: thirdWinnerPublicKey,
          lamports: Math.round(thirdPrize * 1e9),
        })
      ),
    ];

    // 5. Sign and send each transaction
    const { blockhash } = await connection.getLatestBlockhash();
    const signatures = [];
    for (const transaction of transactions) {
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = tournamentKeypair.publicKey;
      transaction.sign(tournamentKeypair);

      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [tournamentKeypair]
      );
      signatures.push(signature);
    }

    // 6. Mark tournament as finished in the database
    await Tournament.finishTournament(tournament_id);

    // 7. Respond with success
    responseHandler.success(
      res,
      {
        totalPrize,
        creatorShare,
        prizePool,
        firstPrize,
        secondPrize,
        thirdPrize,
        transactionSignatures: signatures,
      },
      "Tournament finished successfully"
    );
  } catch (error) {
    console.error("Error finishing tournament:", error);
    responseHandler.error(res, "Failed to finish tournament", error);
  }
};
