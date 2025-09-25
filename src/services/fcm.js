const { admin } = require("./firebase");

const sendNotification = async ({ token, title, description, body }) => {
  const message = {
    token: token,
    notification: {
      title,
      body: description || '',
    },
    data: {
      title: title,
      description: description || '',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      body: JSON.stringify(body || {}, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ),
    },
    android: {
      priority: 'high',
    },
  };

  console.log("📦 Message Payload:", title);

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending message:", error);

    if (
      error.errorInfo?.code === "messaging/registration-token-not-registered"
    ) {
      console.warn(`⚠️ Invalid token: ${token}`);
    }

    return null;
  }
};

const sendNotificationToTopic = async (topic, messageTemplate) => {
  const message = {
    topic: topic,
    ...messageTemplate,
  };
  console.log("📦 Message Payload:", title);
  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message to topic:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending message to topic:", error);

    if (
      error.errorInfo?.code === "messaging/registration-token-not-registered"
    ) {
      console.warn(`⚠️ Invalid token (topic fallback): ${topic}`);
    }

    return null;
  }
};

module.exports = { sendNotification, sendNotificationToTopic };