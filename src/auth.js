import { generateId } from './utils';
import { saveRegisteredUser, fetchRegisteredUsers } from './googleSheets';

export async function registerUser(shopName, ownerName, phoneNumber, password, industryType) {
  const userId = generateId('user');
  const userData = {
    id: userId,
    phone: String(phoneNumber).trim(),
    password: password,
    owner_name: ownerName,
    shop_name: shopName,
    industry_type: industryType,
    status: 'active',
  };

  const result = await saveRegisteredUser(userData);
  if (!result.success) return result;

  const users = JSON.parse(localStorage.getItem('pos-users') || '[]');
  users.push(userData);
  localStorage.setItem('pos-users', JSON.stringify(users));
  localStorage.setItem('pos-user-token', userId);
  localStorage.setItem('pos-current-user', JSON.stringify(userData));

  return { success: true, userData };
}

export async function loginUser(phoneNumber, password) {
  const users = await fetchRegisteredUsers();
  const phone = String(phoneNumber).trim();
  const user = users.find(u => String(u.phone).trim() === phone);

  if (!user) return { success: false, error: 'Phone not registered' };
  if (String(user.password) !== String(password)) return { success: false, error: 'Wrong password' };

  localStorage.setItem('pos-user-token', user.id);
  localStorage.setItem('pos-current-user', JSON.stringify(user));
  return { success: true, user };
}

export function getCurrentUser() {
  const user = localStorage.getItem('pos-current-user');
  return user ? JSON.parse(user) : null;
}

export function isUserLoggedIn() {
  return !!localStorage.getItem('pos-user-token');
}

export function logoutUser() {
  localStorage.removeItem('pos-user-token');
  localStorage.removeItem('pos-current-user');
  return { success: true };
}
