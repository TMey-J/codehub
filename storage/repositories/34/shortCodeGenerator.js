// shortCodeGenerator.js
const storage = require('./storage');

const CODE_LENGTH = 6;
const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generates a random short code of length CODE_LENGTH.
 * @returns {string}
 */
function generateRandomCode() {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARSET.length);
    code += CHARSET[randomIndex];
  }
  return code;
}

/**
 * Generates a unique short code that does not exist in storage.
 * @returns {Promise<string>}
 */
async function generateUniqueCode() {
  let code;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 100;

  while (exists && attempts < maxAttempts) {
    code = generateRandomCode();
    const record = await storage.findByCode(code);
    exists = (record !== null);
    attempts++;
  }

  if (exists) {
    throw new Error('Unable to generate a unique short code after multiple attempts');
  }

  return code;
}

module.exports = { generateUniqueCode };