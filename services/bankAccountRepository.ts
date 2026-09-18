import { storage } from './storage';

export type BankAccount = { id: string; accountHolder: string; bankName: string; ifsc: string; accountNumber: string; upiId: string; isReceivingAccount: boolean };
export type CreateBankAccount = Omit<BankAccount, 'id' | 'isReceivingAccount'>;
const STORAGE_KEY = 'letrent_bank_accounts';
const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: 'bank-1', accountHolder: 'Rahul Sharma', bankName: 'HDFC Bank', ifsc: 'HDFC0001234', accountNumber: '612345678901', upiId: 'rahul.sharma@hdfcbank', isReceivingAccount: true },
  { id: 'bank-2', accountHolder: 'Rahul Sharma', bankName: 'State Bank of India', ifsc: 'SBIN0000456', accountNumber: '458712345678', upiId: 'rahul.sharma@sbi', isReceivingAccount: false },
];

/** Replace these local async operations with bank-account API endpoints later. */
export const bankAccountRepository = {
  async getAccounts(): Promise<BankAccount[]> {
    const stored = await storage.get<BankAccount[]>(STORAGE_KEY);
    if (stored) return stored;
    await storage.set(STORAGE_KEY, INITIAL_ACCOUNTS);
    return INITIAL_ACCOUNTS;
  },
  async addAccount(input: CreateBankAccount): Promise<BankAccount> {
    const accounts = await this.getAccounts();
    const account = { ...input, id: `bank-${Date.now()}`, isReceivingAccount: accounts.length === 0 };
    await storage.set(STORAGE_KEY, [...accounts, account]);
    return account;
  },
  async deleteAccount(id: string): Promise<void> {
    const accounts = await this.getAccounts();
    const deletedWasReceiving = accounts.find((account) => account.id === id)?.isReceivingAccount;
    let updated = accounts.filter((account) => account.id !== id);
    if (deletedWasReceiving && updated.length) updated = updated.map((account, index) => ({ ...account, isReceivingAccount: index === 0 }));
    await storage.set(STORAGE_KEY, updated);
  },
  async setReceivingAccount(id: string): Promise<void> {
    const accounts = await this.getAccounts();
    await storage.set(STORAGE_KEY, accounts.map((account) => ({ ...account, isReceivingAccount: account.id === id })));
  },
};
