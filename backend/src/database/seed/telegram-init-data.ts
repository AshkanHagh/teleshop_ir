import { sign } from "@tma.js/init-data-node";
import { randomInt } from "node:crypto";

function main() {
  return sign(
    {
      user: {
        id: parseInt(process.env.USER_ID || `${randomInt(100_000, 999_999)}`),
        first_name: "john",
        last_name: "developer",
        username: `${randomInt(100, 999)}-john`,
      },
      start_param: process.env.REF_ID,
    },
    process.env.TELEGRAM_BOT_TOKEN!,
    new Date(),
  );
}
console.log(main());
