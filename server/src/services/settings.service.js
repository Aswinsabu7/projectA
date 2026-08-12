const { Settings } = require('../models');

const DEFAULT_KEY = 'app_settings';

async function getSettings() {
  let settings = await Settings.findOne({ key: DEFAULT_KEY });
  if (!settings) {
    settings = await Settings.create({ key: DEFAULT_KEY });
  }
  return settings;
}

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

async function updateSettings(payload, updatedBy) {
  const settings = await getSettings();
  const merged = deepMerge(settings.toObject(), payload);
  Object.assign(settings, merged, { updatedBy });
  await settings.save();
  return settings;
}

module.exports = { getSettings, updateSettings };
