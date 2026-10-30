const PREFIX = 'help-rds:';
const read = (key, fallback) => {
  try { const value = localStorage.getItem(PREFIX + key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
  catch { return false; }
};
const stringList = value => Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string'))] : [];

export const getPrefs = () => {
  const value = read('preferences', {});
  const safe = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { theme: safe.theme === 'dark' ? 'dark' : 'light', favorites: stringList(safe.favorites), recent: stringList(safe.recent) };
};
export const savePrefs = value => write('preferences', value);

// A medição de audiência é opcional e fica fora das preferências visuais para
// que uma cópia antiga de `preferences` não reative a coleta sem querer.
export const getMeasurementChoice = () => {
  const value = read('measurement', {});
  return { disabled: Boolean(value && typeof value === 'object' && !Array.isArray(value) && value.disabled === true) };
};
export const saveMeasurementChoice = disabled => write('measurement', { disabled: Boolean(disabled) });

export const getReviewSettings = () => {
  const value = read('review-settings', {});
  const defaults = { dificil:1, medio:3, facil:7 };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= 365 ? value[key] : fallback]));
};
export const saveReviewSettings = value => {
  if (!value || !['dificil','medio','facil'].every(key => Number.isInteger(value[key]) && value[key] >= 1 && value[key] <= 365)) return false;
  return write('review-settings', value);
};
export const getOnboarding = () => { const value = read('onboarding', {}); return Boolean(value && typeof value === 'object' && value.dismissed === true); };
export const saveOnboarding = () => write('onboarding', { dismissed:true });
export const getDraft = id => {
  const value = read(`calculator:${id}`, {});
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
};
export const saveDraft = (id, value) => write(`calculator:${id}`, value);
export const clearDraft = id => { try { localStorage.removeItem(`${PREFIX}calculator:${id}`); return true; } catch { return false; } };
export const getRecords = key => {
  const value = read(`records:${key}`, []);
  return Array.isArray(value) ? value.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : [];
};
export const saveRecords = (key, records) => write(`records:${key}`, records);
export const clearAllLocalData = () => {
  try { Object.keys(localStorage).filter(key => key.startsWith(PREFIX)).forEach(key => localStorage.removeItem(key)); return true; }
  catch { return false; }
};
export const exportLocalData = () => {
  try { return Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith(PREFIX)).map(key => [key.replace(PREFIX, ''), read(key.replace(PREFIX, ''), null)])); }
  catch { return {}; }
};
