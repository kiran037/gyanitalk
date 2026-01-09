import { checkLiveSessions } from "@/lib/schedulers/checkLiveSessions";
import { endCall } from "@/lib/schedulers/endCall";
import { endChat } from "@/lib/schedulers/endChat";
import { exotelCalls } from "@/lib/schedulers/exotolCalls";

export async function POST(req: Request) {
    const { job } = await req.json();

    switch (job) {
        case "endCall":
            await endCall();
            break;

        case "endChat":
            await endChat();
            break;

        case "checkLiveSessions":
            await checkLiveSessions();
            break;

        case "exotelCalls":
            await exotelCalls();
            break;

        default:
            return Response.json({ error: "Invalid job" }, { status: 400 });
    }

    return Response.json({ success: true, job });
}