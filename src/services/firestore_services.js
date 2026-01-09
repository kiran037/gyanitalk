import axios from "axios";
import { format } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

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
    this.apiKey = process.env.FIREBASE_PRIVATE_KEY;
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
    try {
      if (!chatId || !chatId.includes("_")) {
        throw new Error(`Invalid chatId format: ${chatId}`);
      }

      // Extract astroId and userId
      const [astroId, userId] = chatId.split("_");

      // Build both Firestore collection URLs
      const userUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/chats/${chatId}/userschat/${userId}/messages`;
      const astroUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/chats/${chatId}/userschat/${astroId}/messages`;

      // ✅ Fetch both sides
      const [userMessages, astroMessages] = await Promise.all([
        this.fetchMessages(userUrl),
        this.fetchMessages(astroUrl),
      ]);

      // ✅ Merge and remove duplicates properly
      const mergedMessages = [
        ...userMessages,
        ...astroMessages,
      ];

      // ✅ Deduplicate based on unique messageId
      const uniqueMessages = mergedMessages.filter(
        (msg, index, self) =>
          index === self.findIndex((m) => m.messageId === msg.messageId)
      );

      // ✅ Ensure createdAt is always a Date (for sorting)
      uniqueMessages.forEach(msg => {
        if (!(msg.createdAt instanceof Date)) {
          msg.createdAt = new Date(msg.createdAt);
        }
      });

      // ✅ Sort by date (oldest first)
      uniqueMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // ✅ Return all messages cleanly
      return { messages: uniqueMessages };
    } catch (error) {
      console.error("🔥 getFullChat error:", error?.response?.data || error);
      return { messages: [] };
    }
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
          const fields = doc.fields || {};

          // Handle timestamp / string variations
          const rawTime =
            fields.createdAt?.timestampValue ||
            fields.createdAt?.stringValue ||
            null;

          const createdAt = rawTime ? new Date(rawTime) : new Date();

          // ✅ Construct a clean message object
          messages.push({
            messageId: fields.messageId?.stringValue || doc.name,
            message: fields.message?.stringValue || "",
            sender_id: fields.userId1?.stringValue || "",
            receiver_id: fields.userId2?.stringValue || "",
            replymsg: fields.replymsg?.stringValue || "",
            name: doc.name?.split("/").pop() || "",
            createdAt,
            formattedDate: format(createdAt, "dd MMM yyyy, hh:mm a"),
          });
        }
      }
      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken);
    return messages;
  }

  async sendMessage(chatId, senderId, receiverId, message, messageId) {
    try {
      // Use messageId as the document ID
      const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/chats/${chatId}/userschat/${senderId}/messages?documentId=${messageId}`;
      const now = new Date().toISOString();
      const data = {
        fields: {
          messageId: { stringValue: messageId }, // store messageId explicitly
          userId1: { stringValue: senderId },
          userId2: { stringValue: receiverId },
          message: { stringValue: message },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now },
        },
      };
      const response = await axios.post(url, data);
      if (!response?.data) throw new Error("Empty Firestore response");
      return response.data;
    } catch (error) {
      console.error("🔥 Firestore sendMessage error:", error?.response?.data || error);
      throw error;
    }
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
