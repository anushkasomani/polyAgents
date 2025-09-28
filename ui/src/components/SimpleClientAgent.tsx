import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Wallet, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';

interface SimpleClientAgentProps {
  userAddress?: string;
  signer?: any;
}

const ORCHESTRATOR_URL = 'http://localhost:5400';

export function SimpleClientAgent({ userAddress, signer }: SimpleClientAgentProps) {
  const [userIntent, setUserIntent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const createPaymentPayload = async (from: string, to: string, value: string, asset: string) => {
    const now = Math.floor(Date.now() / 1000);
    const nonceRaw = `${now}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    const nonce = ethers.id(nonceRaw);

    const payment = {
      from: ethers.getAddress(from), // Ensure proper checksum
      to: ethers.getAddress(to),     // Ensure proper checksum
      value,
      validAfter: now - 60,
      validBefore: now + 300,
      nonce,
      verifyingContract: ethers.getAddress(asset), // Ensure proper checksum
      chainId: 80002
    };

    // Sign with MetaMask
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: 80002,
      verifyingContract: asset
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
      value: payment.value,
      validAfter: payment.validAfter,
      validBefore: payment.validBefore,
      nonce: payment.nonce
    };

    console.log('🔐 Signing payment with MetaMask...');
    console.log('Domain:', domain);
    console.log('Types:', types);
    console.log('Message:', message);

    // Use ethers.js for signing (same as backend)
    const provider = new ethers.BrowserProvider(signer);
    const wallet = await provider.getSigner();
    const signature = await wallet.signTypedData(domain, types, message);

    console.log('✅ Signature received:', signature);

    const finalPayload = {
      ...payment,
      signature,
      _rawNonce: nonceRaw
    };

    return btoa(JSON.stringify(finalPayload));
  };

  const handleSubmit = async () => {
    if (!userIntent.trim()) return;
    if (!userAddress || !signer) {
      setError('Please connect your wallet first');
      return;
    }

    console.log('🚀 Starting client agent flow...');
    setIsProcessing(true);
    setError(null);
    setResults(null);
    setPaymentRequired(false);
    setPaymentDetails(null);

    try {
      // Step 1: Send intent to orchestrator
      setCurrentStep('Sending intent to orchestrator...');
      console.log('📡 Calling orchestrator:', `${ORCHESTRATOR_URL}/process`);

      const processResponse = await fetch(`${ORCHESTRATOR_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: userIntent
        })
      });

      console.log('📡 Process response status:', processResponse.status);
      const processData = await processResponse.json();
      console.log('📊 Process response data:', processData);

      if (processResponse.status !== 402) {
        throw new Error(`Expected 402 Payment Required, got ${processResponse.status}`);
      }

      // Step 2: Extract payment requirements
      setCurrentStep('Payment required - creating signature...');
      setPaymentRequired(true);

      const accepts = processData.accepts;
      if (!accepts || !Array.isArray(accepts) || accepts.length === 0) {
        throw new Error('No payment requirements found');
      }

      const firstAccept = accepts[0];
      setPaymentDetails({
        payTo: firstAccept.payTo,
        amount: firstAccept.maxAmountRequired,
        asset: firstAccept.asset,
        plan: processData.plan,
        price: processData.price
      });

      console.log('💰 Payment required:', firstAccept);

      // Step 3: Create and sign payment
      setCurrentStep('Signing payment transaction...');

      const paymentPayload = await createPaymentPayload(
        userAddress,
        firstAccept.payTo,
        firstAccept.maxAmountRequired,
        firstAccept.asset
      );

      console.log('💳 Payment payload created:', paymentPayload);

      // Step 4: Execute with payment
      setCurrentStep('Executing services with payment...');

      const executeResponse = await fetch(`${ORCHESTRATOR_URL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': paymentPayload
        },
        body: JSON.stringify({
          plan: processData.plan
        })
      });

      console.log('📡 Execute response status:', executeResponse.status);

      if (!executeResponse.ok) {
        const errorData = await executeResponse.json();
        throw new Error(`Execution failed: ${errorData.error || executeResponse.status}`);
      }

      const executeData = await executeResponse.json();
      console.log('📊 Execute response data:', executeData);

      // Step 5: Show results
      setCurrentStep('Processing complete!');
      setResults(executeData);
      setPaymentRequired(false);

    } catch (err: any) {
      console.error('❌ Error in client agent:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatValue = (value: string) => {
    const num = parseInt(value, 10);
    return (num / 1000000).toFixed(6); // Assuming 6 decimals for USDC
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Your Client Agent
        </h2>
        {/* <p className="text-muted-foreground">
          Direct integration with x402 orchestrator - no complex flows
        </p> */}
      </div>

      {/* Intent Input */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Describe Your Intent
            </label>
            <Textarea
              placeholder="Get BTC sentiment and latest news..."
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isProcessing}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!userIntent.trim() || isProcessing || !userAddress || !signer}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {currentStep}
              </>
            ) : !userAddress || !signer ? (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet First
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Intent
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 border-primary/20">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-foreground">{currentStep}</p>
                <p className="text-sm text-muted-foreground">
                  This may take a few seconds...
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Payment Required */}
      {paymentRequired && paymentDetails && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Payment Required</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <p className="font-medium text-lg">{formatValue(paymentDetails.amount)} USDC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Services:</span>
                  <p className="font-medium">{paymentDetails.plan?.services?.length || 0} services</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pay To:</span>
                  <p className="font-mono text-xs">{formatAddress(paymentDetails.payTo)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Asset:</span>
                  <p className="font-mono text-xs">{formatAddress(paymentDetails.asset)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {paymentDetails.plan?.services?.map((service: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service.service}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-foreground">Execution Complete!</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Services Executed:</span>
                  <p className="font-medium">{results.serviceCount || 0}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant={results.payment?.settled ? 'default' : 'secondary'}>
                    {results.payment?.settled ? 'Settled' : 'Verified'}
                  </Badge>
                </div>
                {results.payment?.transactionHash && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Transaction:</span>
                    <p className="font-mono text-xs break-all">{results.payment.transactionHash}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Service Results:</h4>
                {results.results?.map((result: any, index: number) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{result.service}</span>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    {result.data && (
                      <pre className="text-xs text-muted-foreground bg-background/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
