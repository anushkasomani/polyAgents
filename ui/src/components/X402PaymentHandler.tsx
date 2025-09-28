import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';

interface PaymentDetails {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  verifyingContract: string;
  chainId: number;
}

interface X402PaymentHandlerProps {
  userAddress: string;
  signer: any;
  onPaymentComplete: (paymentPayload: string) => void;
  onPaymentError: (error: string) => void;
}

export function X402PaymentHandler({
  userAddress,
  signer,
  onPaymentComplete,
  onPaymentError
}: X402PaymentHandlerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createPaymentPayload = useCallback(async (
    from: string,
    to: string,
    value: string,
    verifyingContract: string
  ): Promise<PaymentDetails> => {
    const now = Math.floor(Date.now() / 1000);

    // Create nonce using ethers.js compatible method (like the backend client-agent)
    const nonceRaw = `${now}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    const nonce = ethers.id(nonceRaw); // This creates a proper bytes32 hash

    console.log('🔢 Nonce generation:');
    console.log('Nonce raw:', nonceRaw);
    console.log('Nonce hash:', nonce);
    console.log('Nonce length:', nonce.length);

    return {
      from,
      to,
      value, // Keep as string - facilitator expects string
      validAfter: now - 60,
      validBefore: now + 300,
      nonce,
      verifyingContract,
      chainId: 80002 // Polygon Amoy testnet
    };
  }, []);

  const signPayment = useCallback(async (payment: PaymentDetails): Promise<string> => {
    if (!signer) {
      throw new Error('No signer available');
    }

    // EIP-712 domain and types for EIP-3009 TransferWithAuthorization
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: payment.chainId,
      verifyingContract: payment.verifyingContract
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' }
      ]
    };

    const message = {
      from: payment.from,
      to: payment.to,
      value: payment.value, // Keep as string - facilitator expects string
      validAfter: payment.validAfter,
      validBefore: payment.validBefore,
      nonce: payment.nonce
    };

    try {
      console.log('🔐 Requesting signature from MetaMask...');
      console.log('Domain:', domain);
      console.log('Types:', types);
      console.log('Message:', message);
      console.log('Full typed data:', {
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message
      });
      console.log('🔍 Message field types:');
      console.log('  from type:', typeof message.from);
      console.log('  to type:', typeof message.to);
      console.log('  value type:', typeof message.value);
      console.log('  validAfter type:', typeof message.validAfter);
      console.log('  validBefore type:', typeof message.validBefore);
      console.log('  nonce type:', typeof message.nonce);

      // Use ethers.js for signing (same as backend)
      const provider = new ethers.BrowserProvider(signer);
      const wallet = await provider.getSigner();
      const signature = await wallet.signTypedData(domain, types, message);

      console.log('✅ Signature received:', signature);
      console.log('🔍 Payment from address:', payment.from);
      console.log('🔍 User address:', userAddress);
      console.log('🔍 Addresses match:', payment.from.toLowerCase() === userAddress.toLowerCase());
      return signature;
    } catch (err: any) {
      console.error('❌ Signature failed:', err);
      throw new Error(`Failed to sign payment: ${err.message}`);
    }
  }, [signer, userAddress]);

  const handlePaymentRequest = useCallback(async (
    payTo: string,
    amount: string,
    asset: string = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment payload
      const payment = await createPaymentPayload(
        userAddress,
        payTo,
        amount,
        asset
      );

      setPaymentDetails(payment);

      // Sign the payment
      const signature = await signPayment(payment);

      // Create final payload with signature
      const finalPayload = {
        ...payment,
        signature,
        _rawNonce: payment.nonce
      };

      // Encode as base64 (browser-compatible)
      const encodedPayload = btoa(JSON.stringify(finalPayload));

      onPaymentComplete(encodedPayload);
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [userAddress, createPaymentPayload, signPayment, onPaymentComplete, onPaymentError]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: string) => {
    const num = parseInt(value, 10);
    return (num / 1000000).toFixed(6); // Assuming 6 decimals for USDC
  };

  return (
    <div className="space-y-4">
      {paymentDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-primary/20">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-foreground">Payment Details</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">From:</span>
                  <p className="font-mono">{formatAddress(paymentDetails.from)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">To:</span>
                  <p className="font-mono">{formatAddress(paymentDetails.to)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium">{formatValue(paymentDetails.value)} USDC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Chain:</span>
                  <p>Polygon Amoy</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isProcessing && (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <div>
              <p className="font-medium text-foreground">Processing Payment</p>
              <p className="text-sm text-muted-foreground">
                Please sign the transaction in your wallet...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Export a hook for easy use
export function useX402Payment(userAddress: string, signer: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(async (
    payTo: string,
    amount: string,
    asset: string = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'
  ): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔐 Creating payment payload...');
      console.log('PayTo:', payTo);
      console.log('Amount:', amount);
      console.log('Asset:', asset);

      // Create payment payload
      const now = Math.floor(Date.now() / 1000);
      const nonceRaw = `${now}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
      const nonce = ethers.id(nonceRaw); // This creates a proper bytes32 hash

      console.log('🔢 Nonce generation:');
      console.log('Nonce raw:', nonceRaw);
      console.log('Nonce hash:', nonce);
      console.log('Nonce length:', nonce.length);

      const payment = {
        from: userAddress,
        to: payTo,
        value: amount,
        validAfter: now - 60,
        validBefore: now + 300,
        nonce,
        verifyingContract: asset,
        chainId: 80002
      };

      console.log('📝 Payment payload created:', payment);

      // Sign the payment
      const domain = {
        name: 'USDC',
        version: '2',
        chainId: payment.chainId,
        verifyingContract: payment.verifyingContract
      };

      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      };

      const message = {
        from: payment.from,
        to: payment.to,
        value: payment.value, // Keep as string - facilitator expects string
        validAfter: payment.validAfter,
        validBefore: payment.validBefore,
        nonce: payment.nonce
      };

      console.log('🔐 Requesting signature from MetaMask...');
      console.log('Domain:', domain);
      console.log('Types:', types);
      console.log('Message:', message);
      console.log('Full typed data:', {
        domain,
        types,
        primaryType: 'TransferWithAuthorization',
        message
      });
      console.log('🔍 Message field types:');
      console.log('  from type:', typeof message.from);
      console.log('  to type:', typeof message.to);
      console.log('  value type:', typeof message.value);
      console.log('  validAfter type:', typeof message.validAfter);
      console.log('  validBefore type:', typeof message.validBefore);
      console.log('  nonce type:', typeof message.nonce);

      // Use ethers.js for signing (same as backend)
      const provider = new ethers.BrowserProvider(signer);
      const wallet = await provider.getSigner();
      const signature = await wallet.signTypedData(domain, types, message);

      console.log('✅ Signature received:', signature);
      console.log('🔍 Payment from address:', payment.from);
      console.log('🔍 User address:', userAddress);
      console.log('🔍 Addresses match:', payment.from.toLowerCase() === userAddress.toLowerCase());

      const finalPayload = {
        ...payment,
        signature,
        _rawNonce: nonceRaw
      };

      const encodedPayload = btoa(JSON.stringify(finalPayload));

      console.log('📦 Final encoded payload:', encodedPayload);

      setIsProcessing(false);
      return encodedPayload;
    } catch (err: any) {
      console.error('❌ Payment creation failed:', err);
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      setIsProcessing(false);
      throw new Error(errorMessage);
    }
  }, [userAddress, signer]);

  return {
    createPayment,
    isProcessing,
    error
  };
}