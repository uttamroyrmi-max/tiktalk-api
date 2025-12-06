export default async function handler(req, res) {

  // CORS handling
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const {
    receiverId,
    messageText,
    senderName,
    senderId,
    type = "text"
  } = req.body;

  if (!receiverId || !messageText || !senderId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // OneSignal Setup
  const ONESIGNAL_APP_ID = "8e414d3f-9a32-42a3-a562-857b63d925e8";
  const ONESIGNAL_API_KEY = "os_v2_app_rzau2p42gjbkhjlcqv5whwjf5bqznjgsqrnu4emqstaafld4mrdgmm34girx65thg3o5gn4d5pj5jgks25mwtp66quhmppsjyxicqha";

   const payload = {
  app_id: ONESIGNAL_APP_ID,

  include_aliases: {
    external_id: [receiverId]
  },

  channel_for_external_user_ids: "push", // REQUIRED 🚨
  target_channel: "push", // REQUIRED 🚨

  headings: { en: senderName || "TikTalk" },
  contents: { en: messageText },
  priority: 10,

  data: {
    type,
    chatId: senderId,
    openUrl: `/main.html?chatId=${senderId}`
  }
};




  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Basic ${ONESIGNAL_API_KEY}`
  },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error("OneSignal Server Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
