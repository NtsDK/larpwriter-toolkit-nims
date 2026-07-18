import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';

export interface User {
  name: string;
  role: string;
}

export class AuthStore {
  user: User | null = null;
  loading = false;

  constructor(private root: RootStore) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isLoggedIn() {
    return this.user !== null;
  }

  get isAdmin() {
    return this.user?.role === 'organizer';
  }

  async login(username: string, password: string) {
    this.loading = true;
    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({ username, password }),
        redirect: 'manual',
      });
      if (res.ok || res.status === 302) {
        runInAction(() => {
          this.user = { name: username, role: 'organizer' };
        });
        return true;
      }
      return false;
    } finally {
      runInAction(() => { this.loading = false; });
    }
  }

  async logout() {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    runInAction(() => { this.user = null; });
  }
}
