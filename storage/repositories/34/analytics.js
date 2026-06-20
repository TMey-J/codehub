// analytics.js
const storage = require('./storage');

/**
 * Records a click event for a given short code.
 * @param {string} code
 * @param {Date} [clickTime] - Optional, defaults to now.
 * @returns {Promise<void>}
 */
async function recordClick(code, clickTime = new Date()) {
  const record = await storage.findByCode(code);
  if (!record) {
    throw new Error(`Short code "${code}" not found`);
  }

  // Increment clicks and append click timestamp
  const currentClicks = record.clicks || 0;
  const history = record.clickHistory || [];
  history.push(clickTime.toISOString());

  await storage.update(code, {
    clicks: currentClicks + 1,
    clickHistory: history,
    lastClickedAt: clickTime.toISOString()
  });
}

/**
 * Retrieves analytics data for a given code.
 * @param {string} code
 * @returns {Promise<Object>} - { originalUrl, createdAt, clicks, clickHistory, lastClickedAt }
 */
async function getAnalytics(code) {
  const record = await storage.findByCode(code);
  if (!record) {
    throw new Error(`Short code "${code}" not found`);
  }

  // Return a clean analytics object (exclude any internal fields if needed)
  const { originalUrl, createdAt, clicks, clickHistory, lastClickedAt } = record;
  return {
    originalUrl,
    createdAt,
    clicks: clicks || 0,
    clickHistory: clickHistory || [],
    lastClickedAt: lastClickedAt || null
  };
}

module.exports = { recordClick, getAnalytics };