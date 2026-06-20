// urlService.js
const { generateUniqueCode } = require('./shortCodeGenerator');
const storage = require('./storage');

/**
 * Creates a new shortened URL.
 * @param {string} originalUrl - The long URL to shorten.
 * @returns {Promise<{ code: string, originalUrl: string, createdAt: string }>}
 */
async function createShortUrl(originalUrl) {
  // Basic URL validation (optional)
  if (!originalUrl) {
    throw new Error('Original URL is required');
  }

  const code = await generateUniqueCode();
  const now = new Date().toISOString();

  const urlData = {
    originalUrl,
    createdAt: now,
    clicks: 0,
    clickHistory: []
  };

  await storage.save(code, urlData);

  return { code, originalUrl, createdAt: now };
}

/**
 * Retrieves the original URL for a given short code.
 * @param {string} code
 * @returns {Promise<string>} - The original URL.
 */
async function getOriginalUrl(code) {
  const record = await storage.findByCode(code);
  if (!record) {
    throw new Error('Short URL not found');
  }
  return record.originalUrl;
}

module.exports = { createShortUrl, getOriginalUrl };