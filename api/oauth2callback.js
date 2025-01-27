const { google } = require("googleapis");
const fs = require("fs");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/api/oauth2callback`
);

export default async function handler(req, res) {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Simpan token ke storage sementara (tidak permanen di Vercel)
    fs.writeFileSync("/tmp/tokens.json", JSON.stringify(tokens));
    res.send("Authentication successful! You can now upload videos.");
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Authentication failed.");
  }
}
