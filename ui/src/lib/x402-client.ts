import { Account } from 'viem';
import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch';

export interface X402Service {
  account: Account;
  baseURL: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: any;
  error?: string;
  paymentDetails?: any;
}

export class X402Client {
  private fetchWithPayment: typeof fetch;
  
  constructor(private config: X402Service) {
    this.fetchWithPayment = wrapFetchWithPayment(fetch, config.account);
  }

  async makePayment(endpoint: string, options: RequestInit = {}): Promise<PaymentResponse> {
    try {
      const url = `${this.config.baseURL}${endpoint}`;
      
      const response = await this.fetchWithPayment(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const body = await response.json();
      
      // Decode payment response if available
      const paymentResponseHeader = response.headers.get('x-payment-response');
      let paymentDetails = null;
      
      if (paymentResponseHeader) {
        paymentDetails = decodeXPaymentResponse(paymentResponseHeader);
      }

      return {
        success: response.ok,
        data: body,
        paymentDetails,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment request failed',
        data: error.response?.data,
      };
    }
  }

  async requestService(serviceEndpoint: string, requestData?: any): Promise<PaymentResponse> {
    return this.makePayment(serviceEndpoint, {
      method: 'POST',
      body: requestData ? JSON.stringify(requestData) : undefined,
    });
  }

  async getServiceInfo(serviceEndpoint: string): Promise<PaymentResponse> {
    return this.makePayment(serviceEndpoint, {
      method: 'GET',
    });
  }
}

// Service endpoint definitions
export const X402_SERVICES = {
  AI_ANALYSIS: '/ai/analysis',
  CODE_GENERATION: '/ai/code',
  CREATIVE_TASKS: '/ai/creative',
  RESEARCH: '/ai/research',
  DATA_PROCESSING: '/ai/data',
} as const;

export type ServiceEndpoint = typeof X402_SERVICES[keyof typeof X402_SERVICES];

// Mock service configuration for development
export const MOCK_SERVICES = {
  baseURL: import.meta.env.VITE_X402_RESOURCE_SERVER_URL || 'http://localhost:3001',
  facilitatorURL: import.meta.env.VITE_X402_FACILITATOR_URL || 'http://localhost:3002',
} as const;