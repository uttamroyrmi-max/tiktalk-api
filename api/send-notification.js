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
  const ONESIGNAL_API_KEY = "b47u7eau4ulmu4qpvnmpv67tt";

   const payload = {
  app_id: ONESIGNAL_APP_ID,
  include_aliases: {
    external_id: [receiverId] // ← matches the logged user
  },
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
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${ONESIGNAL_API_KEY}`,
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
