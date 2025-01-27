const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/api/oauth2callback`
);

export default function handler(req, res) {
  const scopes = ["https://www.googleapis.com/auth/youtube.upload"];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(authUrl);
}
