const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/api/oauth2callback`
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { title, description, videoPath } = req.body;

      // Cek apakah token tersedia
      const tokensPath = "/tmp/tokens.json";
      if (!fs.existsSync(tokensPath)) {
        return res.status(400).send("You must authenticate first.");
      }

      const tokens = JSON.parse(fs.readFileSync(tokensPath));
      oauth2Client.setCredentials(tokens);

      const youtube = google.youtube({ version: "v3", auth: oauth2Client });

      const response = await youtube.videos.insert({
        part: "snippet,status",
        requestBody: {
          snippet: {
            title: title,
            description: description,
          },
          status: {
            privacyStatus: "private",
          },
        },
        media: {
          body: fs.createReadStream(path.resolve(videoPath)),
        },
      });

      res.status(200).send(`Video uploaded successfully! Video ID: ${response.data.id}`);
    } catch (error) {
      console.error("Error uploading video:", error);
      res.status(500).send("Error uploading video.");
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
        }
