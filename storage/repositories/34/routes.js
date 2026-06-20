// routes.js
const express = require('express');
const urlService = require('./urlService');
const analytics = require('./analytics');

const router = express.Router();

/**
 * POST /shorten
 * Body: { "originalUrl": "https://example.com/very/long/url" }
 * Response: { "code": "abc123", "originalUrl": "...", "createdAt": "..." }
 */
router.post('/shorten', async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    const result = await urlService.createShortUrl(originalUrl);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /:code
 * Redirects to the original URL and records a click.
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const originalUrl = await urlService.getOriginalUrl(code);

    // Record the click asynchronously (don't block the redirect)
    analytics.recordClick(code).catch(err => console.error('Click recording failed:', err));

    // Redirect to the original URL (302 Found)
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(404).json({ error: 'Short URL not found' });
  }
});

/**
 * GET /analytics/:code
 * Returns analytics for a given short code.
 * Response: { originalUrl, createdAt, clicks, clickHistory, lastClickedAt }
 */
router.get('/analytics/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const stats = await analytics.getAnalytics(code);
    res.json(stats);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;