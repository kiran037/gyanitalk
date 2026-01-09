import axios from "axios";

export class Exotel {
    private static callerId = process.env.EXOTEL_CALLER_ID!;
    private static apiKey = process.env.EXOTEL_API_KEY!;
    private static apiToken = process.env.EXOTEL_API_TOKEN!;
    private static subdomain = process.env.EXOTEL_SUBDOMAIN ; 
    private static accountSid = process.env.EXOTEL_ACCOUNT_SID!;

    private static get authHeader() {
        const token = Buffer.from(
            `${this.apiKey}:${this.apiToken}`
        ).toString("base64");

        return `Basic ${token}`;
    }

    /**
     * 📞 Create Exotel Call
     */
    static async createCall(
        from: string,
        to: string,
        callId: number | string,
        time: number
    ) {
        // ⛔ max 4 hours
        if (time > 14400) time = 14400;

        const url = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/connect.json`;

        const data = new URLSearchParams({
            From: `+91${from}`,
            To: `+91${to}`,
            CallerId: this.callerId,
            TimeLimit: time.toString(),
            StatusCallback: `${process.env.API_PUBLIC_URL}/api/exotel/callback`,
            status_callback_events: "terminal,answered",
            Record: "true",
            CustomField: callId.toString(),
            CallType: "trans",
        });

        const response = await axios.post(url, data, {
            headers: {
                Authorization: this.authHeader,
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        return response.data;
    }

    /**
     * 🔍 Fetch Call Details by SID
     */
    static async callDetail(sid: string) {
        const url = `https://api.exotel.com/v1/Accounts/${this.accountSid}/Calls/${sid}.json`;
 
        const response = await axios.get(url, {
            headers: {
                Authorization: this.authHeader,
                Accept: "application/json",
            },
        });
        return response.data;
    }
}
