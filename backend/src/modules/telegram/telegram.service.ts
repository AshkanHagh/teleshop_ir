import { InlineKeyboard } from "grammy";
import { fastify } from "src/app.js";

fastify.bot.command("start", (ctx) => {
  ctx.reply("خوش اومدی دوست عزیز! 🌟 برای ادامه، روی دکمه پایین کلیک کن.", {
    reply_markup: new InlineKeyboard()
      .url("ورود به مینی اپ", fastify.config.TELEGRAM_WEB_PAGE_URL)
      .url("پشتیبانی", fastify.config.TELEGRAM_SUPPORT_URL),
  });
});
