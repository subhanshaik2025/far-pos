import { generateId } from './utils';

export async function registerUser(shopName, ownerName, phoneNumber, password, industryType) {
  try {
    // Validate password
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const userId = generateId('user');
    
    const userData = {
      id: userId,
      phone: phoneNumber,
      password: password, // In production, this should be hashed
      owner_name: ownerName,
      shop_name: shopName,
      industry_type: industryType,
      status: 'active',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
    };

    const users = JSON.parse(localStorage.getItem('pos-users') || '[]');
    
    // Check if phone already registered
    if (users.find(u => u.phone === phoneNumber)) {
      throw new Error('This phone number is already registered');
    }

    users.push(userData);
    localStorage.setItem('pos-users', JSON.stringify(users));
    localStorage.setItem('pos-user-token', userId);
    localStorage.setItem('pos-current-user', JSON.stringify(userData));

    console.log('✅ User registered successfully');
    return { success: true, userId, userData };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(phoneNumber, password) {
  try {
    const users = JSON.parse(localStorage.getItem('pos-users') || '[]');
    const user = users.find(u => u.phone === phoneNumber);

    if (!user) {
      throw new Error('Phone number not registered. Please register first.');
    }

    // Check password
    if (user.password !== password) {
      throw new Error('Invalid password. Please try again.');
    }

    if (user.status === 'inactive') {
      throw new Error('Your account has been deactivated. Contact support.');
    }

    // Update last login
    user.last_login = new Date().toISOString();
    const userIndex = users.findIndex(u => u.phone === phoneNumber);
    users[userIndex] = user;
    localStorage.setItem('pos-users', JSON.stringify(users));
    
    localStorage.setItem('pos-user-token', user.id);
    localStorage.setItem('pos-current-user', JSON.stringify(user));

    console.log('✅ Login successful');
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('pos-current-user');
  return user ? JSON.parse(user) : null;
}

export function getUserToken() {
  return localStorage.getItem('pos-user-token');
}

export function isUserLoggedIn() {
  return !!localStorage.getItem('pos-user-token');
}

export function logoutUser() {
  localStorage.removeItem('pos-user-token');
  localStorage.removeItem('pos-current-user');
  localStorage.removeItem('pos-shop');
  localStorage.removeItem('pos-industry');
  localStorage.removeItem('pos-products');
  localStorage.removeItem('pos-bills');
  localStorage.removeItem('pos-customers');
  return { success: true, message: 'Logged out successfully' };
}

export function getAllUsers() {
  return JSON.parse(localStorage.getItem('pos-users') || '[]');
}

export function updateUser(userId, updates) {
  try {
    const users = JSON.parse(localStorage.getItem('pos-users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    localStorage.setItem('pos-users', JSON.stringify(users));

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('pos-current-user', JSON.stringify(users[userIndex]));
    }

    return { success: true, user: users[userIndex] };
  } catch (error) {
    console.error('Update user error:', error);
    return { success: false, error: error.message };
  }
}

export function deleteUser(userId) {
  try {
    const users = JSON.parse(localStorage.getItem('pos-users') || '[]');
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem('pos-users', JSON.stringify(filtered));
    return { success: true, message: 'User deleted' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: error.message };
  }
}
