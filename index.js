import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

const bot = new Telegraf(BOT_TOKEN);

/* ================= SAFE INIT ================= */

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

const codes = JSON.parse(fs.readFileSync("./codes.json"));

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ================= NUMBER GENERATE ================= */

function generateNumber(prefix) {
  const last = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}***${last}`;
}

/* ================= 7 SEC TEST DELAY ================= */

function getDelay() {
  return 7000; // TEST MODE ⚡
}

/* ================= COUNTRY SWITCH ================= */

function updateCountry() {
  const now = Date.now();

  // 1 hour switch
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

  const text =
`Your verification code is ${code}

I repeat

Your verification code is ${code}`;

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
⏱ Duration: 10s

Powered by Smart Method`;

    await bot.telegram.sendAudio(
      GROUP_ID,
      { source: file },
      { caption }
    );

    // safe delete
    setTimeout(async () => {
      await fs.remove(file);
    }, 3000);

  } catch (err) {
    console.log("ERROR:", err);
  }

  setTimeout(sendCall, getDelay());
}

/* ================= BOT START ================= */

bot.start((ctx) => {
  ctx.reply("🤖 Ornag Call Bot Running (TEST MODE 7s)");
});

bot.launch();

console.log("🤖 Bot Started...");

/* ================= LOOP ================= */

sendCall();
