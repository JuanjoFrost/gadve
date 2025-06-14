import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPANY_KEY = '@login_company_preference';
const USERNAME_KEY = '@login_username_preference';
const APIBASE_KEY = '@login_apibase_preference';
const APIKEY_KEY = '@login_apikey_preference';

export const saveLoginPreferences = async (preferences) => {
  const { company, username, apiBase, apiKey } = preferences;
  try {
    const operations = [];
    if (company !== null && company !== undefined) {
      operations.push(AsyncStorage.setItem(COMPANY_KEY, company));
    } else {
      operations.push(AsyncStorage.removeItem(COMPANY_KEY));
    }

    if (username !== null && username !== undefined) {
      operations.push(AsyncStorage.setItem(USERNAME_KEY, username));
    } else {
      operations.push(AsyncStorage.removeItem(USERNAME_KEY));
    }

    if (apiBase !== null && apiBase !== undefined) {
      operations.push(AsyncStorage.setItem(APIBASE_KEY, apiBase));
    } else {
      operations.push(AsyncStorage.removeItem(APIBASE_KEY));
    }

    if (apiKey !== null && apiKey !== undefined) {
      operations.push(AsyncStorage.setItem(APIKEY_KEY, apiKey));
    } else {
      operations.push(AsyncStorage.removeItem(APIKEY_KEY));
    }
    await Promise.all(operations);
  } catch (e) {
    console.error('Error al guardar las preferencias de login:', e);
  }
};

export const loadLoginPreferences = async () => {
  try {
    const company = await AsyncStorage.getItem(COMPANY_KEY);
    const username = await AsyncStorage.getItem(USERNAME_KEY);
    const apiBase = await AsyncStorage.getItem(APIBASE_KEY);
    const apiKey = await AsyncStorage.getItem(APIKEY_KEY);
    
    const loadedPrefs = {
        company: company || '',
        username: username || '', 
        apiBase: apiBase || '',   
        apiKey: apiKey || ''    
    };

    return loadedPrefs;
  } catch (e) {
    console.error('Error al cargar las preferencias de login:', e);
    return { company: '', username: '', apiBase: '', apiKey: '' };
  }
};

export const clearLoginPreferences = async () => {
  try {
    await AsyncStorage.removeItem(COMPANY_KEY);
    await AsyncStorage.removeItem(USERNAME_KEY);
    await AsyncStorage.removeItem(APIBASE_KEY);
    await AsyncStorage.removeItem(APIKEY_KEY);
  } catch (e) {
    console.error('Error al eliminar las preferencias de login:', e);
  }
};