require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');

const router = express.Router();

router.get('/api/oauth2callback', async (req, res) => {
  const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.BASE_URL}/api/oauth2callback`
  );

  const { code } = req.query;

  try {
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
    res.send('Authentication successful! Tokens saved.');
  } catch (error) {
    res.status(500).send('Error authenticating');
  }
});

module.exports = router;
