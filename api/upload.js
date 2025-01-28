require('dotenv').config();
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();

router.post('/api/upload', async (req, res) => {
  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth2callback`
  );
  
  // Simulasi upload video ke YouTube
  const youtube = google.youtube({ version: 'v3', auth });

  try {
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: 'Test Upload',
          description: 'Video uploaded via Node.js API',
        },
        status: {
          privacyStatus: 'private',
        },
      },
      media: {
        mimeType: 'video/mp4',
        body: req.files.video, // Pastikan input video benar
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
