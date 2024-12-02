const Tournament = require("../models/tournament");
const responseHandler = require("../utils/responseHandler");
const bs58 = require("bs58");
const {
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// Connection to Solana mainnet
const connection = new Connection(
  "https://api.mainnet-beta.solana.com",
  "confirmed"
);

// Sender's private key in Base58 format (Replace with actual key)
const privateKeyBase58 =
  "55WZm6iRXe1FCY8wrUu9QDKJ6pq5734CDonDhi2gsa62ALTnt7cCussoty4adJY2nFMHYzmQSJZxtbvLAis51g27";
const privateKeyUint8Array = bs58.decode(privateKeyBase58);

// Generate the sender's keypair and public key
const senderKeypair = Keypair.fromSecretKey(privateKeyUint8Array);
const senderPublicKey = senderKeypair.publicKey;

// Custom token mint address (Replace with your token's mint address)
const mintAddress = new PublicKey(
  "F1C6XiAmwyxviv3zacQwTnoeRMmV1GrDzATWMVeN6MU4"
); // Replace with your token's mint address

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
    // Extract required details from the request body
    const { first_wallet, second_wallet, third_wallet, tournament_id } =
      req.body;

    // Retrieve tournament details using the tournament_id
    const tournament = await Tournament.getTournamentDetails(tournament_id);
    if (!tournament) {
      // If no tournament is found, return an error response
      return responseHandler.error(res, "Tournament not found");
    }

    const { entry_price, creator_wallet_address } = tournament;

    // Get the list of players participating in the tournament
    const players = await Tournament.getPlayers(tournament_id);
    if (players.length === 0) {
      // If no players are found, return an error response
      return responseHandler.error(res, "No players found in this tournament");
    }

    // Calculate the total prize pool based on the number of players and entry price
    const totalPrize = players.length * entry_price;

    // Determine the commission for the tournament creator (5%)
    const creatorCommission = 0.05;
    const creatorShare = totalPrize * creatorCommission;

    // Calculate the remaining prize pool after deducting the creator's share
    const prizePool = totalPrize - creatorShare;

    // Distribute the prize pool: 50% to the first winner, 30% to the second, and 20% to the third
    // const firstPrize = prizePool * 0.5;
    const firstPrize = 10;
    // const secondPrize = prizePool * 0.3;
    const secondPrize = 10;
    // const thirdPrize = prizePool * 0.2;
    const thirdPrize = 10;

    // Transfer the prize to the winners

    console.log("Transferring Commision prize...");
    await transferTokens("4WGekea4izj7qzD8TJCRywpMcn8uDhjXqQmjFo8GdtUq", 10);

    console.log("Transferring first prize...");
    await transferTokens(first_wallet, firstPrize);

    console.log("Transferring second prize...");
    await transferTokens(second_wallet, secondPrize);

    console.log("Transferring third prize...");
    await transferTokens(third_wallet, thirdPrize);

    return responseHandler.success(
      res,
      "Tournament finished and prizes distributed"
    );
  } catch (error) {
    // Handle any unexpected errors
    return responseHandler.error(
      res,
      "An error occurred while finishing the tournament"
    );
  }
};

// Function to fetch the custom token balance
async function getTokenBalance() {
  try {
    const senderTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      senderPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );
    const accountInfo = await getAccount(connection, senderTokenAccount);

    console.log(
      `Token balance: ${accountInfo.amount.toString()} (in smallest unit)`
    );
    return accountInfo.amount.toString();
  } catch (error) {
    console.error("Error fetching token balance:", error);
    throw error;
  }
}

async function transferTokens(receiverWalletAddress, transferAmount) {
  try {
    const receiverPublicKey = new PublicKey(receiverWalletAddress);

    const senderTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      senderPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );
    const receiverTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      receiverPublicKey,
      false,
      TOKEN_PROGRAM_ID
    );

    const receiverAccountInfo = await connection.getAccountInfo(
      receiverTokenAccount
    );
    if (!receiverAccountInfo) {
      throw new Error("Receiver does not have an associated token account.");
    }

    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      receiverTokenAccount,
      senderPublicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    const transaction = new Transaction().add(transferInstruction);

    // Fetch the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [senderKeypair],
      {
        commitment: "processed",
      }
    );

    console.log(`Transfer successful! Transaction Signature: ${signature}`);
  } catch (error) {
    if (error.name === "TransactionExpiredBlockheightExceededError") {
      console.error("Transaction expired, retrying...");
      await transferTokens(receiverWalletAddress, transferAmount); // Retry logic
    } else {
      console.error("Error during token transfer:", error);
      throw error;
    }
  }
}
