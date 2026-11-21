export type CheckoutItemType = 'design' | 'folder';

export interface CheckoutTaxLine {
  name?: string;
  label?: string;
  amountPaise: number;
  [key: string]: unknown;
}

export interface CheckoutPreview {
  currency: string;
  paymentEnvironment: string;
  isTestMode: boolean;
  item: {
    type: CheckoutItemType;
    id: string;
    name: string;
  };
  itemPricePaise: number;
  taxes: {
    enabled: boolean;
    totalPaise: number;
    lines: CheckoutTaxLine[];
  };
  buyerFee: {
    enabled: boolean;
    amountPaise: number;
  };
  totalPayablePaise: number;
  notice: string;
}

export interface CheckoutOrder {
  designId?: string;
  folderId?: string;
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  environment: string;
  isRealMoney: boolean;
  checkoutBreakdown: CheckoutPreview;
}

export interface PurchaseStatus {
  designId?: string;
  folderId?: string;
  status: 'unpaid' | 'pending' | 'paid';
  purchaseId?: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface DesignDownloadGrant {
  url: string;
  fileName: string;
  expiresAt: string;
}

export interface FolderDownloadGrant {
  folderId: string;
  downloadUri: string;
  expiresAt: string;
}
