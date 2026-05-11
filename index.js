import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

const bot = new Telegraf(BOT_TOKEN);

const ADMIN_ID = 8136997138;

let botRunning = true;

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

const codes = JSON.parse(fs.readFileSync("./codes.json"));

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ================= TEXT ================= */

function getLocalizedText(countryCode) {
  const texts = {
    "+39": "Il tuo codice di verifica è",
    "+91": "आपका वेरिफिकेशन कोड है",
    "+880": "আপনার ভেরিফিকেশন কোড হলো",
    "+1": "Your verification code is"
  };
  return texts[countryCode] || "Your verification code is";
}

/* ================= SPEECH ================= */

function codeToSpeech(code) {
  const words = {
    "0": "zero","1": "one","2": "two","3": "three","4": "four",
    "5": "five","6": "six","7": "seven","8": "eight","9": "nine"
  };

  return code.toString().split("").map(d => words[d]).join(" ");
}

/* ================= NUMBER ================= */

function generateNumber(prefix) {
  const last = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}***${last}`;
}

/* ================= DELAY ================= */

function getDelay() {
  return 5000;
}

/* ================= COUNTRY ================= */

function updateCountry() {
  const now = Date.now();

  if (now - countryStart >= 3600000) {
    countryIndex = (countryIndex + 1) % countries.length;
    countryStart = now;
  }

  if (Math.random() < 0.5) {
    countryIndex = Math.floor(Math.random() * countries.length);
  }

  currentCountry = countries[countryIndex];
}

/* ================= VOICE ================= */

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

/* ================= SEND ================= */

async function sendCall() {

  if (!botRunning) {
    setTimeout(sendCall, 2000);
    return;
  }

  try {

    updateCountry();

    const code = codes[codeIndex];
    codeIndex = (codeIndex + 1) % codes.length;

    const number = generateNumber(currentCountry.code);
    const file = `./temp/${Date.now()}.mp3`;

    await createVoice(code, file);

    const time = new Date().toLocaleString();

    const caption =
`<b>✨ CALL ALERT SYSTEM</b>

━━━━━━━━━━━━━━
⏰ <b>Time:</b> ${time}
🌍 <b>Country:</b> ${currentCountry.flag} ${currentCountry.name}
☎️ <b>Number:</b> <code>${number}</code>
🔢 <b>Code:</b> <code>XXX-XXX</code>
⏱ <b>Duration:</b> 10s
━━━━━━━━━━━━━━

⚡ <b>Mode:</b> Call To Mp3 Generator

<i>Powered by Smart Method 🤖</i>`;

    await bot.telegram.sendAudio(
      GROUP_ID,
      { source: file },
      {
        caption,
        parse_mode: "HTML"
      }
    );

    setTimeout(() => fs.remove(file), 3000);

  } catch (err) {
    console.log("ERROR:", err);
  }

  setTimeout(sendCall, getDelay());
}

/* ================= COMMANDS ================= */

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

bot.start((ctx) => {
  ctx.reply(`👋 Welcome to Ornag Call Bot 🤖✨

🔥 Status: Online
🌍 System: Call Generator
🔢 Feature: OTP Voice System

⚡ /on /off (Admin only)
`);
});

bot.launch();
console.log("🤖 Bot Started...");

sendCall();
