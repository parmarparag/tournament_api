const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");
const db = require("./db");

const SOLANA_CLUSTER = "https://api.devnet.solana.com"; // Use the appropriate Solana cluster
// const SOLANA_CLUSTER = "https://api.mainnet-beta.solana.com";  // Production
const connection = new Connection(SOLANA_CLUSTER);

class Player {
  static async joinTournament(data) {
    // 1. Ensure necessary fields are provided
    if (!data.wallet_address || !data.tournament_id || !data.entry_price) {
      throw new Error("Missing required fields");
    }

    // 2. Get creator's wallet address from the tournament
    const tournamentSql = `SELECT creator_wallet_address FROM tournaments WHERE id = ?`;
    const [rows] = await db.execute(tournamentSql, [data.tournament_id]);
    if (!rows.length) throw new Error("Tournament not found");
    const creatorWalletAddress = rows[0].creator_wallet_address;

    // 3. Set up transfer details
    const playerWallet = new PublicKey(data.wallet_address);
    const creatorWallet = new PublicKey(creatorWalletAddress);

    // Prepare the transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: playerWallet,
        toPubkey: creatorWallet,
        lamports: Math.round(data.entry_price * 1e9), // Convert SOL to lamports
      })
    );

    // 5. Fetch the latest blockhash and assign it to the transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // 6. Set the fee payer
    transaction.feePayer = playerWallet; // Typically, the player is the fee payer

    // Serialize transaction for the client to sign
    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false, // Allow player to sign
      })
      .toString("base64");

    // Return the serialized transaction to the client
    return { serializedTransaction };
  }

  static async confirmAndRecordTransaction(signature, data) {
    // 1. Confirm the transaction
    try {
      await connection.confirmTransaction(signature, "confirmed");
      console.log(`Transaction confirmed: ${signature}`);
    } catch (error) {
      console.error("Transaction confirmation failed:", error);
      throw new Error("Transaction confirmation failed");
    }

    // 2. Record the player in the tournament
    const sql = `INSERT INTO players (tournament_id, wallet_address, entry_price) VALUES (?, ?, ?)`;
    await db.execute(sql, [
      data.tournament_id,
      data.wallet_address,
      data.entry_price,
    ]);

    console.log("Player successfully recorded in the tournament");
  }
}

module.exports = Player;
