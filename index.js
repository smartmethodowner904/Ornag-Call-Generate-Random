import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

/* ================= BOT INIT ================= */

const bot = new Telegraf(BOT_TOKEN);

/* ================= ADMIN ================= */

const ADMIN_ID = 8136997138;

/* ================= STATE ================= */

let botRunning = true;

/* ================= SAFE INIT ================= */

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

const codes = JSON.parse(fs.readFileSync("./codes.json"));

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ================= LANGUAGE TEXT ================= */

function getLocalizedText(countryCode) {

  const texts = {
    "+39": "Il tuo codice di verifica è",
    "+91": "आपका वेरिफिकेशन कोड है",
    "+880": "আপনার ভেরিফিকেশন কোড হলো",
    "+1": "Your verification code is"
  };

  return texts[countryCode] || "Your verification code is";
}

/* ================= CODE TO SPEECH ================= */

function codeToSpeech(code) {
  const words = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine"
  };

  return code
    .toString()
    .split("")
    .map(d => words[d])
    .join(" ");
}

/* ================= NUMBER GENERATE ================= */

function generateNumber(prefix) {
  const last = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}***${last}`;
}

/* ================= DELAY ================= */

function getDelay() {
  return 5000; // 5 seconds
}

/* ================= COUNTRY SWITCH ================= */

function updateCountry() {

  const now = Date.now();

  // normal hourly switch (backup system)
  if (now - countryStart >= 3600000) {
    countryIndex++;
    if (countryIndex >= countries.length) countryIndex = 0;
    countryStart = now;
  }

  // RANDOM MIX MODE (main feature)
  if (Math.random() < 0.5) {
    countryIndex = Math.floor(Math.random() * countries.length);
  }

  currentCountry = countries[countryIndex];
}

/* ================= CREATE VOICE ================= */

async function createVoice(code, file) {
async function createVoice(code, file) {

  const spokenCode = codeToSpeech(code);

  const langText = getLocalizedText(currentCountry.code);

  const text =
`${langText}

${spokenCode}

I repeat

${spokenCode}`;

  return new Promise((resolve, reject) => {

    const tts = new gTTS(text, currentCountry.lang);

    tts.save(file, (err) => {
      if (err) reject(err);
      else resolve();
    });

  });
}

/* ================= SEND CALL ================= */

async function sendCall() {

  if (!botRunning) {
    setTimeout(sendCall, 2000);
    return;
  }

  try {

    updateCountry();

    const code = codes[codeIndex];

    codeIndex++;

    if (codeIndex >= codes.length) {
      codeIndex = 0;
    }

    const number = generateNumber(currentCountry.code);

    const file = `./temp/${Date.now()}.mp3`;

    await createVoice(code, file);

    const time = new Date().toLocaleString();

    const caption =
`🔥 NEW 🌍 CALL RECEIVED ✨

⏰ Time: ${time}
${currentCountry.flag} Country: ${currentCountry.name}
☎️ Number: ${number}
🔢 Code: ${code}
⏱ Duration: 10s

Powered by Smart Method`;

    await bot.telegram.sendAudio(
      GROUP_ID,
      { source: file },
      { caption }
    );

    setTimeout(async () => {
      await fs.remove(file);
    }, 3000);

  } catch (err) {
    console.log("ERROR:", err);
  }

  setTimeout(sendCall, getDelay());
}

/* ================= ADMIN COMMANDS ================= */

bot.command("on", (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = true;
  ctx.reply("✅ Bot is NOW ON");
});

bot.command("off", (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = false;
  ctx.reply("⛔ Bot is NOW OFF");
});

/* ================= START MESSAGE ================= */

bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to Ornag Call Bot 🤖✨

🔥 Status: Online
🌍 System: Orange Panel Call Recording Generator
🔢 Feature: OTP Voice To Mp3 System

⚡ Commands:
▶ /on - Start bot (Admin only)
⛔ /off - Stop bot (Admin only)

🚀 Enjoy your system!`
  );
});

/* ================= BOT START ================= */

bot.launch();

console.log("🤖 Bot Started...");

/* ================= LOOP ================= */

sendCall();
