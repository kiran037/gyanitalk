import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import axios from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);

// ✅ Helper to format Firestore timestamps
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return dayjs(timestamp).tz("Asia/Kolkata").format("DD MMMM YYYY, h:mm a");
};

class FirestoreService {
  constructor() {
    this.projectId = process.env.FIREBASE_PROJECT_ID;
    this.apiKey = process.env.FIREBASE_PRIVATE_KEYY;
  }

  async getChatMessages(chatId) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_chats/${chatId}?key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data || { error: "Failed to fetch messages" };
  }

  async updateChatMessage(chatId) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_chats/${chatId}?key=${this.apiKey}&updateMask.fieldPaths=is_chat_ended`;
    const data = {
      fields: { is_chat_ended: { booleanValue: true } },
    };
    const response = await axios.patch(url, data);
    return response.data;
  }

  async getCallMessages(chatId) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_calls/${chatId}?key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data || { error: "Failed to fetch messages" };
  }

  async updateCallMessage(chatId) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_calls/${chatId}?key=${this.apiKey}&updateMask.fieldPaths=is_call_ended`;
    const data = {
      fields: { is_call_ended: { booleanValue: true } },
    };
    const response = await axios.patch(url, data);
    return response.data;
  }

  async getFullChat(chatId, user1) {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/chats/${chatId}/userschat/${user1}/messages`;
    return { messages: await this.fetchMessages(baseUrl) };
  }

  async fetchMessages(url) {
    let messages = [];
    let nextPageToken = null;

    do {
      const apiUrl = url + (nextPageToken ? `?orderBy=createdAt%20desc&pageToken=${nextPageToken}` : `?orderBy=createdAt%20desc`);
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.documents) {
        for (const doc of data.documents) {
          const fields = doc.fields;
          messages.push({
            name: doc.name || "",
            message: fields.message?.stringValue || "",
            messageId: fields.messageId?.stringValue || "",
            sender_id: fields.userId1?.stringValue || "",
            receiver_id: fields.userId2?.stringValue || "",
            replymsg: fields.replymsg?.stringValue || "",
            createdAt: formatDate(fields.createdAt?.timestampValue),
          });
        }
      }
      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);

    return messages.reverse();
  }

  async sendMessage(chatId, senderId, receiverId, message) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/chats/${chatId}/userschat/${senderId}/messages`;
    const now = new Date().toISOString();
    const data = {
      fields: {
        userId1: { stringValue: senderId },
        userId2: { stringValue: receiverId },
        message: { stringValue: message },
        createdAt: { timestampValue: now },
        updatedAt: { timestampValue: now },
      },
    };
    const response = await axios.post(url, data);
    return response.data;
  }

  async getLiveStatus(channelName) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_live_stream/${channelName}?key=${this.apiKey}`;
    const response = await axios.get(url);
    return response.data || { error: "Failed to fetch messages" };
  }

  async updateLiveStatus(channelName) {
    const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/active_live_stream/${channelName}?key=${this.apiKey}&updateMask.fieldPaths=is_live_ended`;
    const data = {
      fields: { is_live_ended: { booleanValue: true } },
    };
    const response = await axios.patch(url, data);
    return response.data;
  }

  async getFullAiChat(chatId) {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/ai_chats/${chatId}/messages`;
    const messages = await this.fetchMessages(baseUrl);
    const filtered = messages.filter(
      (msg) => msg.message || msg.replymsg
    );
    return { messages: filtered.slice(-5) };
  }
}

export default FirestoreService;
