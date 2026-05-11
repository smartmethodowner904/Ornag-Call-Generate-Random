import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

const bot = new Telegraf(BOT_TOKEN);

const codes = JSON.parse(fs.readFileSync("./codes.json"));

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ================= RANDOM NUMBER ================= */

function generateNumber(prefix) {
  const last = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}***${last}`;
}

/* ================= RANDOM DELAY ================= */

function getDelay() {
  return Math.floor(Math.random() * 30000) + 30000;
}

/* ================= CHANGE COUNTRY ================= */

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
      {
        caption
      }
    );

    await fs.remove(file);

  } catch (err) {
    console.log(err);
  }

  setTimeout(sendCall, getDelay());
}

/* ================= START ================= */

bot.start((ctx) => {
  ctx.reply("🤖 AI Call Bot Running");
});

bot.launch();

console.log("🤖 AI Call Bot Started");

/* ================= AUTO LOOP ================= */

sendCall();
