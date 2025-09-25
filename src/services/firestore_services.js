const { DateTime } = require('luxon');
const { db } = require("./firebase");

class FirestoreService {

    async getFullAiChat(chatId) {
        const collectionRef = db.collection(`ai_chats/${chatId}/messages`);
        const messages = await this.fetchMessages(collectionRef);
        const filtered = messages
            .filter(m => m.message || m.replymsg)
            .slice(-5);
        return {
            filtered,
        };
    }

    async fetchMessages(collectionRef) {
        let messages = [];
        const snapshot = await collectionRef.orderBy('createdAt', 'asc').get();

        snapshot.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.() || null;

            messages.push({
                name: doc.id || '',
                message: data.message || '',
                messageId: data.messageId || '',
                sender_id: data.userId1 || '',
                receiver_id: data.userId2 || '',
                replymsg: data.replymsg || '',
                createdAt: createdAt
                    ? DateTime.fromJSDate(createdAt, { zone: 'Asia/Kolkata' }).toFormat('dd LLLL yyyy, hh:mm a')
                    : '',
            });
        });

        return messages;
    }
}

module.exports = new FirestoreService();