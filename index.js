import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

const bot = new Telegraf(BOT_TOKEN);

/* ================= ADMIN ================= */

const ADMIN_ID = 8136997138;

/* ================= STATE ================= */

let botRunning = true;

/* ================= INIT ================= */

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

const codes = JSON.parse(fs.readFileSync("./codes.json"));

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ================= PREMIUM EMOJI MAP ================= */

const emojiMap = [
  { char: "🔥", id: "5399898266265475100" },
  { char: "🌍", id: "5852452429009784458" },
  { char: "✨", id: "5852452429009784458" },
  { char: "🕒", id: "5215394081911351762" },
  { char: "🇮🇹", id: "5291783691633179315" },
  { char: "☎️", id: "5465169893580086142" },
  { char: "🔢", id: "6109432142079466939" },
  { char: "⏱", id: "5458640241915084025" }
];

/* ================= SAFE ENTITY BUILDER ================= */

function buildEntities(text) {

  let entities = [];

  for (const e of emojiMap) {

    let start = 0;

    while (true) {
      const index = text.indexOf(e.char, start);
      if (index === -1) break;

      entities.push({
        type: "custom_emoji",
        offset: [...text.slice(0, index)].length,
        length: [...e.char].length,
        custom_emoji_id: e.id
      });

      start = index + e.char.length;
    }
  }

  return entities;
}

/* ================= DIGIT SPEECH ================= */

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

  return code.toString().split("").map(d => words[d]).join(" ");
}

/* ================= NUMBER ================= */

function generateNumber(prefix) {
  const last = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}***${last}`;
}

/* ================= DELAY ================= */

function getDelay() {
  return 7000;
}

/* ================= COUNTRY ROTATION ================= */

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

/* ================= VOICE ================= */

async function createVoice(code, file) {

  const spokenCode = codeToSpeech(code);

  const text =
`Your verification code is

${spokenCode}

I repeat

${spokenCode}`;

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
`🔥 NEW 🌍 CALL RECEIVED ✨

🕒 Time: ${time}
🇮🇹 Country: ITALY
☎️ Number: ${number}
🔢 Code: ${code}
⏱ Duration: 10s

Powered by Smart System`;

    await bot.telegram.sendMessage(GROUP_ID, caption, {
      entities: buildEntities(caption)
    });

    setTimeout(async () => {
      await fs.remove(file);
    }, 3000);

  } catch (err) {
    console.log("ERROR:", err);
  }

  setTimeout(sendCall, getDelay());
}

/* ================= START ================= */

bot.start((ctx) => {
  ctx.reply(
`👋 Welcome to Ornag Call Bot 🤖

🔥 Status: Online
🌍 System: Random Call Generator
🔢 Feature: OTP Voice + Premium Emoji System

Commands:
/on - admin only
/off - admin only`
  );
});

/* ================= ADMIN COMMANDS ================= */

bot.command("on", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = true;
  ctx.reply("✅ Bot ON");
});

bot.command("off", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = false;
  ctx.reply("⛔ Bot OFF");
});

/* ================= START BOT ================= */

bot.launch();
console.log("🤖 Bot Running...");

sendCall();
