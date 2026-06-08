const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTxbABa4eyA2ItAKkrb322QJ-bPBSdnbX2syVvZ2UQo8WcGGvGP2zmJPC3ueZXDyIsTY7AANiU4ta56/pub?output=csv';

export async function initializeAppData() {
  try {
    const existing = localStorage.getItem('far-pos-allowed-users');
    
    // Fetch from Google Sheet CSV
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const users = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values[0]) { // if phone exists
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
    
  } catch (error) {
    console.error('Error loading from Google Sheet:', error);
    // Fallback to hardcoded users if sheet fetch fails
    const fallbackUsers = [
      { phone: '9533360607', ownerName: 'Subhan', shopName: 'Far', industryType: 'salon', plan: 'pro', status: 'active' },
      { phone: '9876543210', ownerName: 'Subhan', shopName: 'My Kirana Store', industryType: 'kirana', plan: 'pro', status: 'active' },
    ];
    localStorage.setItem('far-pos-allowed-users', JSON.stringify(fallbackUsers));
    console.log('⚠️ Using fallback users');
  }
}
