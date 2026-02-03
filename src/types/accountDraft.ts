import type { AccountType } from "../stores/accounts";

export type DraftErrors = Partial<
  Record<"meta" | "type" | "login" | "password", string>
>;

export type Draft = {
  id: string;
  metaInput: string;
  type: AccountType;
  login: string;
  passwordInput: string;
  errors: DraftErrors;
  isSaved: boolean;
};
