import { env } from "@env";
import { Hono } from "hono";
import { fetch } from "bun";

interface TelegramMessage {
    chat: {
        id: number;
    };
    text: string;
}

interface WebhookRequest {
    message?: TelegramMessage;
}

const TELEGRAM_BOT_TOKEN = env.BOT_FATHER_SECRET;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const startMessage = "خوش اومدی دوست عزیز! 🌟 برای ادامه، روی دکمه پایین کلیک کن.";
const keyboard = {
    inline_keyboard: [
        [
            { text: "ورود به تلشاپ 🚀", url: "https://t.me/teleshop_ir_bot/teleshop_ir" }
        ]
    ]
};

async function sendMessage(chatId: number, text: string, replyMarkup?: object): Promise<Response> {
    return fetch(TELEGRAM_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            reply_markup: replyMarkup,
        }),
    });
}

const app = new Hono();

app.post("/webhook", async (ctx) => {
    try {
        const body: WebhookRequest = await ctx.req.json();
        const message = body.message;

        if (message && message.text) {
            const chatId = message.chat.id;
            const text = message.text;

            if (text === "/start") {
                await sendMessage(chatId, startMessage, keyboard);
            }
        }

        return ctx.text("OK", 200);
    } catch (error) {
        console.error("Error handling webhook:", error);
        return ctx.text("Error", 500);
    }
});

app.post("/send-message", async (ctx) => {
    try {
        const body = await ctx.req.json();
        const { userId, message } = body;

        if (!userId || !message) {
            return ctx.json({ message: "اطلاعات کاربر یا پیام ناقص است" }, 400);
        }

        const response = await sendMessage(userId, message);
        const responseData = await response.json();

        return ctx.json({ success: true, data: responseData }, 200);
    } catch (error) {
        console.error("Error sending message:", error);
        return ctx.json({ success: false, message: "خطا در ارسال پیام" }, 500);
    }
});

export default app;