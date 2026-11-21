export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
  handler: (response: RazorpaySuccessResponse) => void;
}

interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', handler: (response: RazorpayFailureResponse) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-designhub-razorpay]');
    const script = existing ?? document.createElement('script');
    const finish = () => window.Razorpay ? resolve() : reject(new Error('Razorpay Checkout did not become available.'));
    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', () => reject(new Error('Could not load Razorpay Checkout. Check your connection and try again.')), { once: true });
    if (!existing) {
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.designhubRazorpay = 'true';
      document.head.appendChild(script);
    }
  }).catch((error) => {
    loader = null;
    throw error;
  });
  return loader;
};

export const createRazorpay = (options: RazorpayOptions) => {
  if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable.');
  return new window.Razorpay(options);
};
