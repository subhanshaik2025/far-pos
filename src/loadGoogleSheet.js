export function initializeAppData() {
  const existing = localStorage.getItem('far-pos-allowed-users');
  if (!existing) {
    const sampleUsers = [
      { phone: '9533360607', ownerName: 'Subhan', shopName: 'Far', industryType: 'salon', plan: 'pro', status: 'active' },
      { phone: '9876543210', ownerName: 'Ramesh', shopName: 'Test Shop', industryType: 'kirana', plan: 'starter', status: 'active' },
      { phone: '9988776655', ownerName: 'Priya', shopName: 'Restaurant', industryType: 'restaurant', plan: 'pro', status: 'active' },
    ];
    localStorage.setItem('far-pos-allowed-users', JSON.stringify(sampleUsers));
    console.log('✅ Sample users loaded!');
  }
}
