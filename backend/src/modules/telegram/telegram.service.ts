import fp from "fastify-plugin";
import { InlineKeyboard } from "grammy";

export default fp(async (fastify) => {
  fastify.bot.command("start", async (ctx) => {
    await ctx.reply(
      "خوش اومدی دوست عزیز! 🌟 برای ادامه، روی دکمه پایین کلیک کن.",
      {
        reply_markup: new InlineKeyboard()
          .url("ورود به مینی اپ", fastify.config.TELEGRAM_WEB_PAGE_URL)
          .url("پشتیبانی", fastify.config.TELEGRAM_SUPPORT_URL),
      },
    );
  });
});
