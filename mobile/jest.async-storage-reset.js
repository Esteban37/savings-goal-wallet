const AsyncStorage = require('@react-native-async-storage/async-storage');
const storage = AsyncStorage.default ?? AsyncStorage;

beforeEach(async () => {
  if (storage && typeof storage.clear === 'function') {
    await storage.clear();
  }
});
