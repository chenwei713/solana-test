import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import BN from "bn.js";

// Connect to devnet
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Payer is my own account
const payer = pg.wallet.keypair;
console.log("Using existing Wallet Address:", payer.publicKey.toBase58());

// generate a random Account key pair
const counter = web3.Keypair.generate();
console.log("Counter Public Key:", counter.publicKey.toBase58());

const PROGRAM_ID = new PublicKey(
  "6quBqtegVG5HRBZEvcCTxHgH6DivxnXmnYfoYvuC16Sc"
);

// Initialize Account
const callInitializeMethod = async () => {
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]); // initialize 的 discriminator
  const data = discriminator; // 没有 args，直接使用 discriminator 作为指令数据

  const tx = new Transaction().add({
    keys: [
      { pubkey: counter.publicKey, isSigner: true, isWritable: true },
      { pubkey: payer.publicKey, isSigner: true, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  await sendAndConfirmTransaction(connection, tx, [payer, counter]);
  console.log("Transaction Signature (Initialize):", tx.signature);
};

const callIncrementMethod = async () => {
  const discriminator = Buffer.from([11, 18, 104, 9, 104, 174, 59, 33]); // increment 的 discriminator
  const data = discriminator; // 没有 args，直接使用 discriminator 作为指令数据

  const tx = new Transaction().add({
    keys: [{ pubkey: counter.publicKey, isSigner: false, isWritable: true }],
    programId: PROGRAM_ID,
    data,
  });

  await sendAndConfirmTransaction(connection, tx, [payer]);
  console.log("Transaction Signature (Increment):", tx.signature);
};

const getCounterValue = async () => {
  const accountInfo = await connection.getAccountInfo(counter.publicKey);
  // console.log(`Get Account INFO: ${accountInfo.toString()}`);
  if (!accountInfo || !accountInfo.data) {
    console.error("Account data not found");
    return;
  }

  // skip first 8 bit
  const countBuffer = accountInfo.data.slice(8, 15);
  const count = new BN(countBuffer, "le"); // 使用小端序解析

  console.log(`Counter value: ${count.toString()}`);
};

const getRawAccountData = async () => {
  const accountInfo = await connection.getAccountInfo(counter.publicKey);
  if (!accountInfo) {
    throw new Error("Account not found on chain");
  }

  console.log("Raw Account Data (Hex):", accountInfo.data.toString("hex"));
};

(async () => {
  try {
    console.log("Calling Initialize Method...");
    await callInitializeMethod();

    console.log("Original Counter Value");
    await getCounterValue();

    console.log("Calling Increment Method...");
    await callIncrementMethod();

    console.log("Updated Counter Value");
    await getCounterValue();

    // await getRawAccountData();
  } catch (err) {
    console.error("Error during testing:", err);
  }
})();

