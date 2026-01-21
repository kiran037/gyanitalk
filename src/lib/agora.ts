///Users/xeoren/Desktop/gyanitallk-admin/src/lib/agora.ts
import axios from "axios";

function agoraAuthHeader() {
    const token = Buffer.from(
        `${process.env.AGORA_CUSTOMER_ID}:${process.env.AGORA_CUSTOMER_SECRET}`
    ).toString("base64");

    return `Basic ${token}`;
}

export async function getAgoraChannelUsage(
    channelName: string,
    from: string, // YYYY-MM-DD
    to: string    // YYYY-MM-DD
) {
    try {
        const url = `https://api.agora.io/dev/v1/usage`;

        const response = await axios.get(url, {
            headers: {
                Authorization: agoraAuthHeader(),
                "Content-Type": "application/json",
            },
            params: {
                from_date: from,
                to_date: to,
                projects: process.env.AGORA_APP_ID,
            },
        });
        console.log(response)
        const data = response.data;

        // 🔍 Filter by channel name
        const channels = data?.data?.[0]?.channels || [];

        const channelData = channels.find(
            (c: any) => c.channel_name === channelName
        );

        if (!channelData) {
            return {
                channelName,
                duration: 0,
                users: 0,
                message: "No data found for channel",
            };
        }

        return {
            status: true,
            channelName,
            duration: channelData.duration || 0, // seconds
            users: channelData.users || 0,
            audioMinutes: channelData.audio_duration || 0,
            videoMinutes: channelData.video_duration || 0,
        };
    } catch (error) {
        return {
            status: false,
            data: error

        };
    }

}
