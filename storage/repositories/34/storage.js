// storage.js
// In-memory storage implementation. To switch to a database,
// keep the same exported interface (save, findByCode, update, findAll).

const store = new Map(); // key: shortCode, value: urlData

const storage = {
  /**
   * Saves a new URL record.
   * @param {string} code - The short code.
   * @param {Object} urlData - { originalUrl, createdAt, clicks, clickHistory? }
   * @returns {Promise<void>}
   */
  save: async (code, urlData) => {
    store.set(code, urlData);
  },

  /**
   * Finds a URL record by its short code.
   * @param {string} code
   * @returns {Promise<Object|null>} - The urlData or null if not found.
   */
  findByCode: async (code) => {
    return store.get(code) || null;
  },

  /**
   * Updates an existing record (e.g., increments click count, adds history).
   * @param {string} code
   * @param {Object} newData - Partial data to merge.
   * @returns {Promise<void>}
   */
  update: async (code, newData) => {
    const existing = store.get(code);
    if (existing) {
      store.set(code, { ...existing, ...newData });
    }
  },

  /**
   * Returns all stored records (useful for debugging / admin).
   * @returns {Promise<Array>} - Array of { code, ...urlData }
   */
  findAll: async () => {
    const entries = [];
    for (const [code, data] of store.entries()) {
      entries.push({ code, ...data });
    }
    return entries;
  }
};

module.exports = storage;