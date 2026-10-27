const PREFIX = 'help-rds:';
const read = (key, fallback) => {
  try { const value = localStorage.getItem(PREFIX + key); return value ? JSON.parse(value) : fallback; }
  catch { return fallback; }
};
const write = (key, value) => { try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; } catch { return false; } };
export const getPrefs = () => read('preferences', { theme: 'light', favorites: [], recent: [] });
export const savePrefs = value => write('preferences', value);
export const getDraft = id => read(`calculator:${id}`, {});
export const saveDraft = (id, value) => write(`calculator:${id}`, value);
export const clearDraft = id => { try { localStorage.removeItem(`${PREFIX}calculator:${id}`); } catch {} };
export const getRecords = key => read(`records:${key}`, []);
export const saveRecords = (key, records) => write(`records:${key}`, records);
export const clearAllLocalData = () => Object.keys(localStorage).filter(key => key.startsWith(PREFIX)).forEach(key => localStorage.removeItem(key));
export const exportLocalData = () => Object.fromEntries(Object.keys(localStorage).filter(key => key.startsWith(PREFIX)).map(key => [key.replace(PREFIX, ''), read(key.replace(PREFIX, ''), null)]));
