import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

/* ================= BOT INIT ================= */

const bot = new Telegraf(BOT_TOKEN);

/* ================= ADMIN ================= */

const ADMIN_ID = 8136997138; // 👉 এখানে তোমার Telegram ID দাও

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
  return 7000; // TEST MODE
}

/* ================= COUNTRY SWITCH ================= */

function updateCountry() {
  const now = Date.now();

  if (now - countryStart >= 3600000) {
    countryIndex++;

    if (countryIndex >= countries.length) {
      countryIndex = 0;
    }

    currentCountry = countries[countryIndex];
    countryStart = now;
  }
}

/* ================= CREATE VOICE ================= */

async function createVoice(code, file) {

  const spokenCode = codeToSpeech(code);

  const text =
`Your verification code is ${spokenCode}

I repeat

Your verification code is ${spokenCode}`;

  return new Promise((resolve, reject) => {

    const tts = new gTTS(text, "en");

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
`🔥 NEW 🌍 ${currentCountry.name} CALL RECEIVED ✨

🕒 Time: ${time}
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
  ctx.reply("✅ Bot turned ON");
});

bot.command("off", (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = false;
  ctx.reply("⛔ Bot turned OFF");
});

/* ================= START ================= */

bot.start((ctx) => {
  ctx.reply("🤖 Ornag Call Bot Running (TEST MODE)");
});

bot.launch();

console.log("🤖 Bot Started...");

/* ================= LOOP ================= */

sendCall();
