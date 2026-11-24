import type { PaginatedEnvelope } from './marketplace';

export type SettlementMode = 'manual' | 'automatic';
export type EarningStatus = 'pending' | 'available' | 'reserved' | 'paid' | 'refunded' | 'reversed' | 'held';
export type WithdrawalStatus = 'requested' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled' | 'failed';
export type BalanceBucket = 'pending' | 'available' | 'reserved' | 'paid';

export interface WalletSummary {
  currency: string;
  paymentEnvironment: string;
  isTestMode: boolean;
  payoutsEnabled: boolean;
  settlementMode: SettlementMode;
  manualWithdrawalsEnabled: boolean;
  balances: {
    pendingPaise: number;
    waitingSettlementPaise: number;
    availablePaise: number;
    reservedPaise: number;
    paidPaise: number;
  };
  minimumWithdrawalPaise: number;
  hasOpenWithdrawal: boolean;
  canWithdraw: boolean;
  nextReleaseAt: string | null;
  nextSettlementAt: string | null;
}

export interface SettlementSnapshot {
  type: 'monthly_cycle' | 'legacy_hold';
  startDay: number | null;
  endDay: number | null;
  settlementDay: number | null;
  holdDays: number | null;
  timezone: string;
  scheduledAt: string | null;
  label: string;
}

export interface SellerEarning {
  id: string;
  item: { type: string; id: string; name: string };
  currency: string;
  buyerPaidPaise: number;
  taxableAmountPaise: number;
  buyerGst: {
    basisPoints: number;
    percent: number;
    amountPaise: number;
    supplyType: 'none' | 'intra_state' | 'inter_state';
    cgstPaise: number;
    sgstPaise: number;
    igstPaise: number;
    sellerStateCode: string | null;
    buyerStateCode: string | null;
  };
  commissionBasisPoints: number;
  commissionPercent: number;
  commissionPaise: number;
  commissionGst: { basisPoints: number; percent: number; amountPaise: number };
  sellerGrossPaise: number;
  deductionsPaise: number;
  sellerNetPaise: number;
  status: EarningStatus;
  availableAt: string | null;
  settlement: SettlementSnapshot;
  createdAt: string;
}

export interface SellerTransaction {
  id: string;
  earningId: string | null;
  withdrawalId: string | null;
  type: string;
  balanceBucket: BalanceBucket;
  amountPaise: number;
  currency: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SellerWithdrawal {
  id: string;
  amountPaise: number;
  feePaise: number;
  netTransferPaise: number;
  currency: string;
  status: WithdrawalStatus;
  paymentEnvironment: string;
  isTestMode: boolean;
  payoutMode: string;
  requestSource: 'seller' | 'automatic';
  canCancel: boolean;
  requestedAt: string | null;
  cancelledAt: string | null;
  approvedAt: string | null;
  processedAt: string | null;
}

export type EarningsEnvelope = PaginatedEnvelope<SellerEarning[]>;
export type TransactionsEnvelope = PaginatedEnvelope<SellerTransaction[]>;
export type WithdrawalsEnvelope = PaginatedEnvelope<SellerWithdrawal[]>;
