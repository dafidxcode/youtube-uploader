require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.get('/api/auth', (req, res) => {
  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth2callback`
  );

  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtube.upload'],
  });

  res.redirect(authUrl);
});

module.exports = router;
