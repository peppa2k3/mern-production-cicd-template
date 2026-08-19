const Settings = require('./settings.model');

// In-memory cache since settings are read on nearly every public page
// (contact info, footer, socials) but change rarely.
let cache = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60 * 1000;

class SettingsService {
  async getAll() {
    if (cache && Date.now() - cacheLoadedAt < CACHE_TTL_MS) return cache;

    const docs = await Settings.find();
    cache = docs.reduce((acc, doc) => {
      acc[doc.key] = doc.value;
      return acc;
    }, {});
    cacheLoadedAt = Date.now();
    return cache;
  }

  async set(key, value) {
    const doc = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    cache = null; // invalidate
    return doc;
  }

  async setMany(entries) {
    await Promise.all(Object.entries(entries).map(([key, value]) => this.set(key, value)));
    return this.getAll();
  }
}

module.exports = new SettingsService();
