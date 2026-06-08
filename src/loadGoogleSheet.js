import { fetchAllowedUsers, fetchRegisteredUsers } from './googleSheets';

export async function initializeAppData() {
  console.log('🔄 Loading data from Google Sheets...');
  await Promise.all([
    fetchAllowedUsers(),
    fetchRegisteredUsers(),
  ]);
  console.log('✅ Data loaded from Google Sheets');

  setInterval(async () => {
    console.log('🔄 Auto-refreshing from Google Sheets...');
    await Promise.all([fetchAllowedUsers(), fetchRegisteredUsers()]);
  }, 300000);
}
