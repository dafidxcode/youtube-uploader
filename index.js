const express = require("express");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  `${process.env.BASE_URL}/oauth2callback`
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to generate the authentication URL
app.get("/auth", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/youtube.upload"];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.redirect(authUrl);
});

// Endpoint to handle OAuth2 callback
app.get("/oauth2callback", async (req, res) => {
  try {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save tokens (optional, for persistent access)
    fs.writeFileSync("tokens.json", JSON.stringify(tokens));
    res.send("Authentication successful! You can now upload videos.");
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).send("Authentication failed.");
  }
});

// Endpoint to upload a video
app.post("/upload", async (req, res) => {
  try {
    const { title, description, videoPath } = req.body;

    // Check if tokens are available
    if (fs.existsSync("tokens.json")) {
      const tokens = JSON.parse(fs.readFileSync("tokens.json"));
      oauth2Client.setCredentials(tokens);
    } else {
      return res.status(400).send("You must authenticate first.");
    }

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.videos.insert({
      part: "snippet,status",
      requestBody: {
        snippet: {
          title: title,
          description: description,
        },
        status: {
          privacyStatus: "private", // Change to 'public' or 'unlisted' as needed
        },
      },
      media: {
        body: fs.createReadStream(path.resolve(__dirname, videoPath)),
      },
    });

    res.status(200).send(`Video uploaded successfully! Video ID: ${response.data.id}`);
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).send("Error uploading video.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
