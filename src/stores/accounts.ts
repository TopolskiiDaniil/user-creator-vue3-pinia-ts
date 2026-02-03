import { defineStore } from "pinia";

export type AccountType = "ldap" | "local";
export type MetaTag = { text: string };
export type Account = {
  id: string;
  meta: MetaTag[];
  type: AccountType;
  login: string;
  password: string | null;
};

const STORAGE_KEY = "usercreator.accounts.v1";

//впомогательная функция для безопасного парсинга JSON
function safeParseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export const useAccountsStore = defineStore("accounts", {
  state: () => ({
    accounts: [] as Account[],
  }),
  actions: {
    hydrateFromStorage() {
      const raw = safeParseJson<Account[]>(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(raw)) {
        return;
      }
      this.accounts = raw;
    },
    persistToStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.accounts));
    },
    upsertAccount(account: Account) {
      const idx = this.accounts.findIndex((a) => a.id === account.id);
      if (idx === -1) this.accounts.push(account);
      else this.accounts[idx] = account;
      this.persistToStorage();
    },
    removeAccount(id: string) {
      this.accounts = this.accounts.filter((a) => a.id !== id);
      this.persistToStorage();
    },
  },
});
