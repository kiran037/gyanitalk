// ===================================
// FILE: services/fcm.js
// ===================================

const { admin } = require("./firebase");

/**
 * Send notification to a single token
 */
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

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error("❌ Error sending message:", error.message);

    if (error.errorInfo?.code === "messaging/registration-token-not-registered") {
      console.warn(`⚠️ Invalid token: ${token}`);
    }

    return null;
  }
};

/**
 * ✅ NEW: Send notifications to multiple tokens in BATCHES (500 at a time)
 * This is MUCH faster than sending one by one
 */
const sendBatchNotifications = async ({ tokens, title, description, body }) => {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  // Remove duplicates
  const uniqueTokens = [...new Set(tokens)];
  
  // Firebase allows max 500 tokens per batch
  const BATCH_SIZE = 500;
  const batches = [];
  
  for (let i = 0; i < uniqueTokens.length; i += BATCH_SIZE) {
    batches.push(uniqueTokens.slice(i, i + BATCH_SIZE));
  }

  const message = {
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

  let totalSuccess = 0;
  let totalFailure = 0;

  // Process all batches in parallel
  const batchPromises = batches.map(async (batchTokens) => {
    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batchTokens,
        ...message,
      });

      console.log(`✅ Batch sent: ${response.successCount}/${batchTokens.length} delivered`);

      // Log failed tokens for cleanup
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (errorCode === 'messaging/registration-token-not-registered') {
              console.warn(`⚠️ Invalid token to remove: ${batchTokens[idx]}`);
            }
          }
        });
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error("❌ Batch send error:", error.message);
      return {
        successCount: 0,
        failureCount: batchTokens.length,
      };
    }
  });

  // Wait for all batches to complete
  const results = await Promise.all(batchPromises);

  // Sum up results
  results.forEach((result) => {
    totalSuccess += result.successCount;
    totalFailure += result.failureCount;
  });

  console.log(`📊 Total: ${totalSuccess} sent, ${totalFailure} failed`);

  return {
    successCount: totalSuccess,
    failureCount: totalFailure,
  };
};

/**
 * Send notification to a topic
 */
const sendNotificationToTopic = async (topic, messageTemplate) => {
  const message = {
    topic: topic,
    ...messageTemplate,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message to topic:", response);
    return response;
  } catch (error) {
    console.error("❌ Error sending message to topic:", error.message);
    return null;
  }
};

module.exports = { 
  sendNotification, 
  sendBatchNotifications, 
  sendNotificationToTopic 
};