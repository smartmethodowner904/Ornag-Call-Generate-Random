import { Telegraf } from "telegraf";
import fs from "fs-extra";
import gTTS from "gtts";

import { BOT_TOKEN, GROUP_ID } from "./config.js";
import { countries } from "./countries.js";

/* ✅ BOT */
const bot = new Telegraf(BOT_TOKEN);

const ADMIN_ID = 8136997138;

let botRunning = true;

/* 🐢 SLOW MODE */

let slowMode = false;

let slowModeTimer = null;

/* ⚡ FAST MODE */

let fastMode = false;

let fastModeTimer = null;

/* ⏰ AUTO ON TIMER */

let autoOnTimer = null;
let autoSlowInterval = null;

if (!fs.existsSync("./temp")) {
  fs.mkdirSync("./temp");
}

const codes = JSON.parse(
  fs.readFileSync("./codes.json")
);

let countryIndex = 0;
let codeIndex = 0;

let currentCountry = countries[0];
let countryStart = Date.now();

/* ✅ ENABLED COUNTRIES */

let enabledCountries = [
  ...countries
];
/* ================= TEXT ================= */

function getLocalizedText(countryCode) {

const texts = {

"+39": "Il tuo codice di verifica è",  

"+44": "Your verification code is",  

"+81": "あなたの確認コードは",  

"+92": "آپ کا تصدیقی کوڈ ہے",  

"+968": "رمز التحقق الخاص بك هو",  

"+86": "您的验证码是",  

  "+91": "आपका सत्यापन कोड है",

"+880": "আপনার ভেরিফিকেশন কোড হলো",

"+971": "رمز التحقق الخاص بك هو",

"+60": "Kod pengesahan anda ialah",

"+66": "รหัสยืนยันของคุณคือ",

"+7": "Ваш код подтверждения",

"+34": "Su código de verificación es",

"+55": "Seu código de verificação é",

"+20": "رمز التحقق الخاص بك هو",

"+93": "کد تأیید شما این است",

"+212": "رمز التحقق الخاص بك هو",

"+31": "Uw verificatiecode is",

"+46": "Din verifieringskod är",

"+41": "Ihr Bestätigungscode lautet",
  
  "+965": "رمز التحقق الخاص بك هو",

"+216": "رمز التحقق الخاص بك هو",

"+977": "तपाईंको प्रमाणीकरण कोड हो",

"+964": "رمز التحقق الخاص بك هو",

"+998": "Tasdiqlash kodingiz",

"+84": "Mã xác minh của bạn là",

"+94": "ඔබගේ තහවුරු කිරීමේ කේතය",

"+966": "رمز التحقق الخاص بك هو",

"+213": "رمز التحقق الخاص بك هو",

"+263": "Your verification code is",

"+592": "Your verification code is",

"+249": "رمز التحقق الخاص بك هو",

"+234": "Your verification code is",

"+43": "Ihr Bestätigungscode lautet",

"+63": "Your verification code is",

"+52": "Su código de verificación es",
  
"+974": "رمز التحقق الخاص بك هو",
  "+27": "Your verification code is",

"+54": "Your verification code is",

"+57": "Your verification code is",

"+51": "Your verification code is",

"+56": "Your verification code is",

"+351": "Your verification code is",

"+32": "Your verification code is",

"+45": "Your verification code is",

"+358": "Your verification code is",

"+30": "Your verification code is",

"+48": "Your verification code is",

"+40": "Your verification code is",

"+380": "Your verification code is",

"+254": "Your verification code is",

"+255": "Your verification code is",

"+256": "Your verification code is",

"+64": "Your verification code is",

"+61": "Your verification code is",

"+353": "Your verification code is",

"+420": "Your verification code is",

"+36": "Your verification code is",

"+39": "Il tuo codice di verifica è",

"+44": "Your verification code is",

"+81": "あなたの確認コードは",

"+92": "آپ کا تصدیقی کوڈ ہے",

"+968": "رمز التحقق الخاص بك هو",

"+86": "您的验证码是",

"+91": "आपका सत्यापन कोड है",

"+880": "আপনার ভেরিফিকেশন কোড হলো",

"+971": "رمز التحقق الخاص بك هو",

"+60": "Kod pengesahan anda ialah",

"+66": "รหัสยืนยันของคุณคือ",

"+7": "Ваш код подтверждения",

"+34": "Su código de verificación es",

"+55": "Seu código de verificação é",

"+20": "رمز التحقق الخاص بك هو",

"+93": "کد تأیید شما این است",

"+212": "رمز التحقق الخاص بك هو",

"+31": "Uw verificatiecode is",

"+46": "Din verifieringskod är",

"+41": "Ihr Bestätigungscode lautet",

"+965": "رمز التحقق الخاص بك هو",

"+216": "رمز التحقق الخاص بك هو",

"+977": "तपाईंको प्रमाणीकरण कोड हो",

"+964": "رمز التحقق الخاص بك هو",

"+998": "Tasdiqlash kodingiz",

"+84": "Mã xác minh của bạn là",

"+94": "ඔබගේ තහවුරු කිරීමේ කේතය",

"+966": "رمز التحقق الخاص بك هو",

"+213": "رمز التحقق الخاص بك هو",

"+263": "Your verification code is",

"+592": "Your verification code is",

"+249": "رمز التحقق الخاص بك هو",

"+234": "Your verification code is",

"+43": "Ihr Bestätigungscode lautet",

"+63": "Your verification code is",

"+52": "Su código de verificación es",

"+974": "رمز التحقق الخاص بك هو",

"+62": "Kode verifikasi Anda adalah",

"+251": "የማረጋገጫ ኮድዎ ይህ ነው",

"+65": "Your verification code is",

"+98": "کد تأیید شما این است",

"+973": "رمز التحقق الخاص بك هو",

"+47": "Bekreftelseskoden din er",

"+33": "Votre code de vérification est",

"+972": "קוד האימות שלך הוא",

"+49": "Ihr Bestätigungscode lautet",

"+1": "Your verification code is",

"+82": "인증 코드는",

"+90": "Doğrulama kodunuz"
};

return texts[countryCode] || "Hello Your verification code is";
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

  /* ⚡ FAST MODE */

  if (fastMode) {

    const delays = [
      1000,
      1500,
      2000
    ];

    return delays[
      Math.floor(Math.random() * delays.length)
    ];

  }

  /* 🐢 SLOW MODE */

  if (slowMode) {

    const delays = [
      12000,
      18000,
      25000
    ];

    return delays[
      Math.floor(Math.random() * delays.length)
    ];

  }

  /* ⚡ NORMAL MODE */

  const normalDelays = [
    4000,
    5000,
    6000
  ];

  return normalDelays[
    Math.floor(Math.random() * normalDelays.length)
  ];

}

/* ================= COUNTRY ================= */

function updateCountry() {

  /* ❌ NO COUNTRY ENABLED */
  if (enabledCountries.length === 0) {
    currentCountry = null;
    return;
  }

  const now = Date.now();

  if (
    now - countryStart >= 3600000
  ) {

    countryIndex =
      (countryIndex + 1) %
      enabledCountries.length;

    countryStart = now;

  }

  if (Math.random() < 0.5) {

    countryIndex =
      Math.floor(
        Math.random() *
        enabledCountries.length
      );

  }

  currentCountry =
    enabledCountries[countryIndex];

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

  /* ❌ NO COUNTRY ENABLED */
  if (!currentCountry) {
    setTimeout(sendCall, 2000);
    return;
  }

  const code = codes[codeIndex];
  codeIndex = (codeIndex + 1) % codes.length;

  const number = generateNumber(currentCountry.code);
  const file = `./temp/${Date.now()}.mp3`;

  await createVoice(code, file);

  const time = new Date().toLocaleString();
    const caption =
`<b>╭━📡Voice Call Alert📡━╮ </b>
━━━━━TELEGRAM━━━━━

┃⏰ <b>Time:</b> ${time}
┃🌍 <b>Country:</b> ${currentCountry.flag} ${currentCountry.name}

┃☎️ <b>Number:</b> <code>${number}</code>

┃🔐 <b>Access:</b> <code>➤ New China Panel♻️</code>

┃⏱ <b>Duration:</b> ➤ 15 Seconds
 ╰━━━━━━━━━━━━━━━━╯
⚡ <b>Mode:</b> <b>Call To Music Generator</b> — <a href="https://t.me/+2R-AXlxNPWthNGFh">Click Here to join</a>
<b><i>Powered by Smart Method 🤖</i></b>`;

const sentMsg = await bot.telegram.sendAudio(
      GROUP_ID,
      { source: file },
      {
        caption,
        parse_mode: "HTML"
      }
    );

    // ⏳ 5 মিনিট পরে মেসেজ ডিলিট
    setTimeout(async () => {
      try {
        await bot.telegram.deleteMessage(GROUP_ID, sentMsg.message_id);
      } catch (err) {
        console.log("Delete Error:", err);
      }
    }, 300000);

    // 🧹 3 সেকেন্ড পরে ফাইল ডিলিট
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

startAutoSlowMode();

/* ✅ ALL COUNTRY ON AGAIN */
enabledCountries = [...countries];

  ctx.reply(
`✅ Bot Fully ON

🌍 All Countries Enabled`
  );

});

bot.command("off", (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 This command is only for admin");
  }

  botRunning = false;

  enabledCountries = [];

  slowMode = false;
  fastMode = false;

  if (slowModeTimer) {
    clearTimeout(slowModeTimer);
  }

  if (fastModeTimer) {
    clearTimeout(fastModeTimer);
  }

  if (autoOnTimer) {
    clearTimeout(autoOnTimer);
  }

  if (autoSlowInterval) {
    clearInterval(autoSlowInterval);
    autoSlowInterval = null;
  }

  ctx.reply(
`⛔ BOT FULLY OFF

❌ All Systems Disabled
❌ All Countries Disabled
❌ Auto Slow OFF
❌ Fast Mode OFF
❌ Slow Mode OFF

✅ Bot Will Stay OFF Until /on`
  );

});
/* ================= AUTO TIME SYSTEM ================= */

bot.hears(/^\/time(\d+)$/, async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 Admin only command");
  }

  try {
    
    const minutes =
      parseInt(ctx.match[1]);

    if (isNaN(minutes) || minutes <= 0) {
      return ctx.reply("❌ Invalid time");
    }

    /* ✅ BOT OFF */

    botRunning = false;

    /* ⏰ MINUTES → MILLISECONDS */

    const ms =
      minutes * 60 * 1000;

    /* 🔄 REMOVE OLD TIMER */

    if (autoOnTimer) {
      clearTimeout(autoOnTimer);
    }

    /* ✅ AUTO ON */

    autoOnTimer = setTimeout(() => {

      botRunning = true;

      ctx.reply(
`✅ Bot Auto ON Successfully

⏰ OFF Time Finished:
${minutes} Minute`
      ).catch(() => {});

    }, ms);

    ctx.reply(
`⛔ Bot OFF Successfully

⏰ Auto ON After:
${minutes} Minute`
    );

  } catch (e) {

    console.log(e);

  }

});

/* ================= SLOW MODE ================= */

bot.command("slow", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 Admin only command");
  }

  try {

    /* ✅ ENABLE */

    slowMode = true;
    
fastMode = false;
    
    /* 🔄 REMOVE OLD TIMER */

    if (slowModeTimer) {
      clearTimeout(slowModeTimer);
    }

    /* ⏰ AUTO OFF AFTER 5 MIN */

    slowModeTimer = setTimeout(() => {

      slowMode = false;

      ctx.reply(
        "⚡ Slow Mode Auto OFF"
      ).catch(() => {});

    }, 300000);

    ctx.reply(
`🐢 SLOW MODE ON

⚡ Fast Mode OFF
🐢 Slow Mode Activated

⏰ Duration:
5 Minute`
);

  } catch (e) {

    console.log(e);

  }

});
/* ================= FAST MODE ================= */

bot.command("fast", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 Admin only command");
  }

  try {

    fastMode = true;
    slowMode = false;

    if (fastModeTimer) {
      clearTimeout(fastModeTimer);
    }

    fastModeTimer = setTimeout(() => {

      fastMode = false;

      ctx.reply(
        "⚡ Fast Mode Auto OFF"
      ).catch(() => {});

    }, 300000);

    ctx.reply(
`⚡ FAST MODE ON

🚀 Super Fast Sending Started

⏰ Duration:
5 Minute`
    );

  } catch (e) {

    console.log(e);

  }

});
/* ================= NORMAL MODE ================= */

bot.command("normal", async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 Admin only command");
  }

  try {

    fastMode = false;
    slowMode = false;

    ctx.reply(
`✅ NORMAL MODE ON

⚡ Fast OFF
🐢 Slow OFF

🚀 System Back To Normal`
    );

  } catch (e) {

    console.log(e);

  }

});
/* ================= COUNTRY SYSTEM ================= */

bot.hears(/^\/country (.+)$/i, async (ctx) => {

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply("🚫 Admin only command");
  }

  try {

    const input = ctx.match[1].trim().toLowerCase();

    const isOff = input.endsWith(" off");

    const cleanName = isOff
      ? input.replace(" off", "").trim()
      : input;

    /* 🔍 MATCH FULL NAME (LIKE United Kingdom, South Korea) */
    const foundCountry = countries.find(c =>
      c.name.toLowerCase() === cleanName
    );

    if (!foundCountry) {
      return ctx.reply(
`❌ Country Not Found

Example:
/country Pakistan
/country United Kingdom
/country South Korea off`
      );
    }

    /* ❌ OFF */
    if (isOff) {

      enabledCountries = enabledCountries.filter(
        c => c.name !== foundCountry.name
      );

      return ctx.reply(
`⛔ Country OFF

🌍 ${foundCountry.flag} ${foundCountry.name}`
      );
    }

    /* ✅ ON */
    const exists = enabledCountries.find(
      c => c.name === foundCountry.name
    );

    if (!exists) {
      enabledCountries.push(foundCountry);
    }
botRunning = true;

if (!autoSlowInterval) {
  startAutoSlowMode();
}
    return ctx.reply(
`✅ Country ON

🌍 ${foundCountry.flag} ${foundCountry.name}`
    );

  } catch (e) {
    console.log(e);
  }
});

/* ================= START ================= */

bot.start((ctx) => {

  ctx.reply(
    "👋 Welcome to China Call Bot 🤖✨\n\n🔥 Status: Online\n🌍 System: China Panel Call Recording System\n🔢 Feature: OTP Voice Recovered System\n\n⚡ Commands:\n▶ /on - Start bot (Admin only)\n⛔ /off - Stop bot (Admin only)\n\n🚀 Enjoy your system!"
  );

});

/* ================= BOT START ================= */

bot.launch();

console.log("🤖 Bot Started...");
startAutoSlowMode();

/* ================= AUTO RANDOM SLOW ================= */

function startAutoSlowMode() {

  if (autoSlowInterval) {
    clearInterval(autoSlowInterval);
  }

  autoSlowInterval = setInterval(() => {

    if (!botRunning) return;

    slowMode = true;
    fastMode = false;

    console.log("🐢 AUTO SLOW MODE ON");

    setTimeout(() => {

      slowMode = false;

      console.log("⚡ AUTO SLOW MODE OFF");

    }, 300000);

  }, 7200000);

}

/* ================= LOOP ================= */

sendCall();
