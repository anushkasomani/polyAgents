import { useState, useCallback } from 'react';
import { Account, Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { X402Client, PaymentResponse, ServiceEndpoint, MOCK_SERVICES } from '@/lib/x402-client';

export interface UseX402Options {
  privateKey?: Hex;
  baseURL?: string;
}

export interface X402State {
  isLoading: boolean;
  error: string | null;
  lastResponse: PaymentResponse | null;
}

export function useX402(options: UseX402Options = {}) {
  const [state, setState] = useState<X402State>({
    isLoading: false,
    error: null,
    lastResponse: null,
  });

  const [client, setClient] = useState<X402Client | null>(null);

  const initializeClient = useCallback((privateKey: Hex) => {
    try {
      const account = privateKeyToAccount(privateKey);
      const x402Client = new X402Client({
        account,
        baseURL: options.baseURL || MOCK_SERVICES.baseURL,
      });
      setClient(x402Client);
      setState(prev => ({ ...prev, error: null }));
      return x402Client;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize X402 client';
      setState(prev => ({ ...prev, error: errorMessage }));
      return null;
    }
  }, [options.baseURL]);

  const requestService = useCallback(async (
    serviceEndpoint: ServiceEndpoint,
    requestData?: any,
    privateKey?: Hex
  ): Promise<PaymentResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use existing client or create new one
      let activeClient = client;
      
      if (!activeClient && privateKey) {
        activeClient = initializeClient(privateKey);
      }

      if (!activeClient) {
        throw new Error('No X402 client available. Please provide a private key.');
      }

      const response = await activeClient.requestService(serviceEndpoint, requestData);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: response,
        error: response.success ? null : response.error || 'Service request failed',
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service request failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        lastResponse: null,
      }));
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [client, initializeClient]);

  const getServiceInfo = useCallback(async (
    serviceEndpoint: ServiceEndpoint,
    privateKey?: Hex
  ): Promise<PaymentResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let activeClient = client;
      
      if (!activeClient && privateKey) {
        activeClient = initializeClient(privateKey);
      }

      if (!activeClient) {
        throw new Error('No X402 client available. Please provide a private key.');
      }

      const response = await activeClient.getServiceInfo(serviceEndpoint);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastResponse: response,
        error: response.success ? null : response.error || 'Service info request failed',
      }));

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service info request failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        lastResponse: null,
      }));
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [client, initializeClient]);

  return {
    ...state,
    client,
    initializeClient,
    requestService,
    getServiceInfo,
  };
}