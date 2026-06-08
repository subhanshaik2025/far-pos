const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxbABa4eyA2ItAKkrb322QJ-bPBSdnbX2syVvZ2UQo8WcGGvGP2zmJPC3ueZXDyIsTY7AANiU4ta56/pub?output=csv';

async function fetchUsersFromSheet() {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.trim().split('\n');
    const users = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values[0]) {
        users.push({
          phone: values[0],
          ownerName: values[1] || '',
          shopName: values[2] || '',
          industryType: values[3] || '',
          plan: values[4] || 'starter',
          status: values[5] || 'active',
          createdDate: values[6] || new Date().toLocaleDateString(),
        });
      }
    }
    
    localStorage.setItem('far-pos-allowed-users', JSON.stringify(users));
    console.log('✅ Users synced from Google Sheet! Total:', users.length);
    return users;
    
  } catch (error) {
    console.error('Error loading from Google Sheet:', error);
    const fallbackUsers = [
      { phone: '9533360607', ownerName: 'Subhan', shopName: 'Far', industryType: 'salon', plan: 'pro', status: 'active' },
      { phone: '9876543210', ownerName: 'Subhan', shopName: 'My Kirana Store', industryType: 'kirana', plan: 'pro', status: 'active' },
    ];
    localStorage.setItem('far-pos-allowed-users', JSON.stringify(fallbackUsers));
    console.log('⚠️ Using fallback users');
    return fallbackUsers;
  }
}

export async function initializeAppData() {
  // Fetch on app start
  await fetchUsersFromSheet();
  
  // Auto-refresh every 5 minutes (300000 ms)
  setInterval(async () => {
    console.log('🔄 Auto-refreshing users from Google Sheet...');
    await fetchUsersFromSheet();
  }, 300000);
}
