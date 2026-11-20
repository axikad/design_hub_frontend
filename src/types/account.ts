import type { ApiDesign, PaginatedEnvelope } from './marketplace';

export interface AccountRole {
  id: number | string;
  name: string;
  slug: string;
}

export interface AccountMachine {
  id: string;
  name: string;
  imageUri: string | null;
  selected?: boolean;
  designFormConfig?: Record<string, unknown>;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string | null;
  avatarUri: string | null;
  countryCode: string | null;
  mobileNumber: string | null;
  role: AccountRole | null;
  permissions: string[];
  machineFilteringActive: boolean;
  selectedMachineIds: string[];
  selectedMachines: AccountMachine[];
  loginMethods: {
    otp: boolean;
    password: boolean;
  };
  sellerSettlementMode: 'manual' | 'automatic';
}

export interface AuthPayload {
  flow: 'login' | 'register';
  name?: string | null;
  countryCode: string;
  mobileNumber: string;
  machineIds?: string[];
}

export interface AuthResult {
  user: ApiUser;
  accessToken: string;
}

export interface MachinePreferencePayload {
  machineFilteringActive: boolean;
  selectedMachineIds: string[];
  machines: AccountMachine[];
}

export interface ApiPurchase {
  id: string;
  design: ApiDesign;
  amountPaise: number;
  currency: string;
  status: 'paid' | string;
  purchasedAt: string | null;
}

export type SavedDesignEnvelope = PaginatedEnvelope<ApiDesign[]>;
export type PurchaseEnvelope = PaginatedEnvelope<ApiPurchase[]>;
