import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function MetaMaskTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const connectWallet = async () => {
    setError(null);
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask extension.');
      }

      const ethereum = (window as any).ethereum;

      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask.');
      }

      const userAddress = accounts[0];
      setAddress(userAddress);
      setIsConnected(true);
      setTestResult('✅ Wallet connected successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setTestResult('❌ Wallet connection failed');
    }
  };

  const testSignature = async () => {
    if (!isConnected) {
      setError('Please connect wallet first');
      return;
    }

    try {
      const ethereum = (window as any).ethereum;

      // Simple test signature
      const testMessage = 'Hello from x402 demo!';
      const signature = await ethereum.request({
        method: 'personal_sign',
        params: [testMessage, address]
      });

      setTestResult(`✅ Test signature successful: ${signature.slice(0, 20)}...`);
    } catch (err: any) {
      setError(`Signature test failed: ${err.message}`);
      setTestResult('❌ Signature test failed');
    }
  };

  const testTypedData = async () => {
    if (!isConnected) {
      setError('Please connect wallet first');
      return;
    }

    try {
      const ethereum = (window as any).ethereum;

      // Test EIP-712 typed data signature
      const domain = {
        name: 'Test App',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000'
      };

      const types = {
        TestMessage: [
          { name: 'message', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      };

      const message = {
        message: 'Hello from x402 demo!',
        timestamp: Math.floor(Date.now() / 1000)
      };

      const signature = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [address, {
          domain,
          types,
          primaryType: 'TestMessage',
          message
        }]
      });

      setTestResult(`✅ Typed data signature successful: ${signature.slice(0, 20)}...`);
    } catch (err: any) {
      setError(`Typed data signature failed: ${err.message}`);
      setTestResult('❌ Typed data signature failed');
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">MetaMask Connection Test</h3>

      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {testResult && (
        <Alert className={`mb-4 ${testResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{testResult}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {!isConnected ? (
          <Button onClick={connectWallet} className="w-full">
            Connect MetaMask
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Connected: {address}</p>
            <Button onClick={testSignature} className="w-full" variant="outline">
              Test Simple Signature
            </Button>
            <Button onClick={testTypedData} className="w-full" variant="outline">
              Test EIP-712 Signature
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

