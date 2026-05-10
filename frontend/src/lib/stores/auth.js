import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const initialUser = browser ? JSON.parse(sessionStorage.getItem('biis_user') || 'null') : null;

export const user = writable(initialUser);

user.subscribe(val => {
  if (browser) {
    if (val) sessionStorage.setItem('biis_user', JSON.stringify(val));
    else sessionStorage.removeItem('biis_user');
  }
});

export async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) { user.set(null); return null; }
    const data = await res.json();
    user.set(data);
    return data;
  } catch {
    user.set(null);
    return null;
  }
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  user.set(null);
  sessionStorage.removeItem('biis_user');
}
