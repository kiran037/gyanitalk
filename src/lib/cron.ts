import cron from "node-cron";
import { endCall } from "./schedulers/endCall";
import { endChat } from "./schedulers/endChat";
import { checkLiveSessions } from "./schedulers/checkLiveSessions";
import { exotelCalls } from "./schedulers/exotolCalls";


export function startCron() {
    cron.schedule("* * * * *", endCall);
    cron.schedule("* * * * *", endChat);
    cron.schedule("* * * * *", checkLiveSessions);
    cron.schedule("*/30 * * * *", exotelCalls);
}