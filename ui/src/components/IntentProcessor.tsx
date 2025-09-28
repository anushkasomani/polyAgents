import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  DollarSign,
  Clock,
  Lightbulb,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Zap,
  Brain,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useX402Payment } from "@/components/X402PaymentHandler";

interface ServiceResult {
  service: string;
  data: any;
  success: boolean;
  error?: string;
}

interface IntentProcessorProps {
  onResults: (results: ServiceResult[]) => void;
  onError: (error: string) => void;
  userAddress?: string;
  signer?: any;
}

// Orchestrator endpoint
const ORCHESTRATOR_ENDPOINT = 'http://localhost:5400';

// Available microservices mapping (for display purposes)
const SERVICE_MAPPING = {
  'news': { name: 'News Service', price: 0.10 },
  'weather': { name: 'Weather Service', price: 0.05 },
  'sentiment': { name: 'Sentiment Analysis', price: 0.15 },
  'ohlcv': { name: 'OHLCV Data', price: 0.20 },
  'backtest': { name: 'Backtesting', price: 0.50 },
  'oracle': { name: 'Oracle Service', price: 0.25 },
  'geckoterminal': { name: 'GeckoTerminal', price: 0.30 }
};

const exampleIntents = [
  "Get BTC sentiment analysis and latest news",
  "Analyze ETH price trends and run a backtest",
  "Get weather forecast for London and BTC price data",
  "Check trending DeFi pools and market sentiment",
  "Get Chainlink oracle data and news sentiment"
];

export function IntentProcessor({ onResults, onError, userAddress, signer }: IntentProcessorProps) {
  const [userIntent, setUserIntent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [parsedServices, setParsedServices] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [results, setResults] = useState<ServiceResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const { createPayment, isProcessing: isPaymentProcessing, error: paymentError } = useX402Payment(
    userAddress || '',
    signer
  );

  const steps = [
    { name: "Parse Intent", description: "Analyzing your request with orchestrator" },
    { name: "Payment Required", description: "x402 payment protocol activated" },
    { name: "Process Payment", description: "Simulating USDC payment" },
    { name: "Execute Services", description: "Running microservices via orchestrator" },
    { name: "Aggregate Results", description: "Combining all service data" }
  ];

  // Simple intent parsing logic (in real implementation, this would use AI/ML)
  const parseIntent = (intent: string): string[] => {
    const services: string[] = [];
    const lowerIntent = intent.toLowerCase();

    if (lowerIntent.includes('news') || lowerIntent.includes('btc') || lowerIntent.includes('eth') || lowerIntent.includes('crypto')) {
      services.push('news');
    }
    if (lowerIntent.includes('weather') || lowerIntent.includes('forecast') || lowerIntent.includes('london') || lowerIntent.includes('tokyo')) {
      services.push('weather');
    }
    if (lowerIntent.includes('sentiment') || lowerIntent.includes('mood') || lowerIntent.includes('analysis')) {
      services.push('sentiment');
    }
    if (lowerIntent.includes('price') || lowerIntent.includes('ohlcv') || lowerIntent.includes('chart') || lowerIntent.includes('data')) {
      services.push('ohlcv');
    }
    if (lowerIntent.includes('backtest') || lowerIntent.includes('strategy') || lowerIntent.includes('test')) {
      services.push('backtest');
    }
    if (lowerIntent.includes('oracle') || lowerIntent.includes('chainlink') || lowerIntent.includes('feed')) {
      services.push('oracle');
    }
    if (lowerIntent.includes('gecko') || lowerIntent.includes('trending') || lowerIntent.includes('pools') || lowerIntent.includes('defi')) {
      services.push('geckoterminal');
    }

    return services;
  };

  const calculateTotalCost = (services: string[]): number => {
    return services.reduce((total, service) => {
      return total + (SERVICE_MAPPING[service as keyof typeof SERVICE_MAPPING]?.price || 0);
    }, 0);
  };

  const executeService = async (service: string, description: string): Promise<ServiceResult> => {
    // This function is now handled by the orchestrator
    // We'll get results from the orchestrator's execute endpoint
    return { service, data: null, success: false, error: 'Service execution handled by orchestrator' };
  };

  const processIntent = async () => {
    console.log('🔍 processIntent called with userIntent:', userIntent);
    if (!userIntent.trim()) {
      console.log('❌ No user intent provided');
      return;
    }

    if (!userAddress || !signer) {
      onError('Please connect your wallet first');
      return;
    }

    console.log('🚀 Starting intent processing:', userIntent);
    setIsProcessing(true);
    setCurrentStep(0);
    setResults([]);
    setProgress(0);
    setPaymentRequired(false);
    setPaymentDetails(null);

    try {
      // Step 1: Parse Intent with Orchestrator
      setCurrentStep(1);
      setProgress(20);

      console.log('📡 Calling orchestrator:', `${ORCHESTRATOR_ENDPOINT}/process`);
      const processResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: userIntent
        })
      });

      console.log('📡 Orchestrator response status:', processResponse.status);

      // Handle 402 Payment Required as success
      if (processResponse.status === 402 || processResponse.ok) {
        console.log('✅ Orchestrator responded (402 is expected)');
      } else {
        throw new Error(`Orchestrator error: ${processResponse.status}`);
      }

      const processData = await processResponse.json();
      console.log('📊 Orchestrator response data:', processData);

      if (processData.error) {
        throw new Error(processData.error);
      }

      // Extract services from orchestrator response
      const services = processData.plan?.services?.map((s: any) => s.service) || [];
      console.log('🔍 Identified services:', services);
      setParsedServices(services);
      setTotalCost(processData.price || 0);

      // Step 2: Show Payment Required (402)
      setCurrentStep(2);
      setProgress(40);
      setPaymentRequired(true);

      // Extract payment details from 402 response
      if (processResponse.status === 402) {
        const paymentInfo = processData.error?.data?.accepts || processData.accepts;
        if (paymentInfo) {
          const firstAccept = Array.isArray(paymentInfo) ? paymentInfo[0] : paymentInfo;
          setPaymentDetails({
            payTo: firstAccept.payTo,
            amount: firstAccept.maxAmountRequired || processData.price || '10000',
            asset: firstAccept.asset || '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582'
          });
        }
      }

      // Wait for user to process payment
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error('❌ Error in processIntent:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      onError(errorMessage);
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails || !userAddress || !signer) {
      onError('Payment details or wallet not available');
      return;
    }

    try {
      setCurrentStep(3);
      setProgress(60);

      console.log('💳 Starting payment creation...');
      console.log('Payment details:', paymentDetails);
      console.log('User address:', userAddress);
      console.log('Signer available:', !!signer);
      console.log('User address type:', typeof userAddress);
      console.log('User address length:', userAddress?.length);

      // Check if we're on the right network
      if (signer && signer.request) {
        try {
          const chainId = await signer.request({ method: 'eth_chainId' });
          console.log('Current chain ID:', chainId);
          console.log('Expected chain ID: 0x13882 (80002)');
          if (chainId !== '0x13882') {
            console.warn('⚠️ Wrong network! Please switch to Polygon Amoy testnet');
            try {
              await signer.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x13882' }],
              });
              console.log('✅ Switched to Polygon Amoy testnet');
            } catch (switchError: any) {
              if (switchError.code === 4902) {
                // Network not added, try to add it
                try {
                  await signer.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                      chainId: '0x13882',
                      chainName: 'Polygon Amoy Testnet',
                      rpcUrls: ['https://rpc-amoy.polygon.technology'],
                      nativeCurrency: {
                        name: 'MATIC',
                        symbol: 'MATIC',
                        decimals: 18,
                      },
                      blockExplorerUrls: ['https://amoy.polygonscan.com'],
                    }],
                  });
                  console.log('✅ Added Polygon Amoy testnet');
                } catch (addError) {
                  console.error('❌ Failed to add Polygon Amoy testnet:', addError);
                }
              } else {
                console.error('❌ Failed to switch network:', switchError);
              }
            }
          }
        } catch (e) {
          console.log('Could not get chain ID:', e);
        }
      }

      // Create and sign payment
      const paymentPayload = await createPayment(
        paymentDetails.payTo,
        paymentDetails.amount,
        paymentDetails.asset
      );

      console.log('💳 Payment created successfully:', paymentPayload);

      // Step 4: Execute Services with Payment
      setCurrentStep(4);
      setProgress(80);

      console.log('🚀 Executing services with payment...');
      const executeResponse = await fetch(`${ORCHESTRATOR_ENDPOINT}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': paymentPayload
        },
        body: JSON.stringify({
          plan: {
            services: parsedServices.map(service => ({ service }))
          }
        })
      });

      console.log('📡 Execute response status:', executeResponse.status);
      if (!executeResponse.ok) {
        throw new Error(`Execution error: ${executeResponse.status}`);
      }

      const executeData = await executeResponse.json();
      console.log('📊 Execute response data:', executeData);

      // Step 5: Aggregate Results
      setCurrentStep(5);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      const serviceResults: ServiceResult[] = executeData.results?.map((result: any) => ({
        service: result.service,
        data: result.data,
        success: result.success,
        error: result.error
      })) || [];

      console.log('🎉 Final results:', serviceResults);
      setResults(serviceResults);
      onResults(serviceResults);
      setPaymentRequired(false);

    } catch (error) {
      console.error('❌ Error in payment processing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const fillExample = (example: string) => {
    setUserIntent(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Describe Your Intent
        </h2>
        <p className="text-muted-foreground">
          Tell us what you need, and our platform agent will orchestrate the right microservices
        </p>
      </div>

      {/* Example Intents */}
      <Card className="p-4 bg-gradient-to-br from-primary-light to-secondary-light border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Example Intents</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exampleIntents.map((intent, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fillExample(intent)}
              className="text-xs px-3 py-1 rounded-full bg-background/50 hover:bg-background/80 text-foreground border border-primary/20 transition-all"
            >
              {intent}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Intent Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Your Intent
        </label>
        <Textarea
          placeholder="Describe what you want to accomplish... (e.g., 'Get BTC sentiment and latest news')"
          value={userIntent}
          onChange={(e) => setUserIntent(e.target.value)}
          className="min-h-[120px] resize-none border-primary/20 focus:border-primary/40"
          disabled={isProcessing}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{userIntent.split(/\s+/).length} words</span>
          <span>Be specific to get better service matching</span>
        </div>
      </div>

      {/* Processing Steps */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-6 glass border-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Processing Your Intent</h3>
                  <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>

                <Progress value={progress} className="w-full" />

                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${currentStep > index + 1
                        ? 'bg-success/10 text-success'
                        : currentStep === index + 1
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                        }`}
                    >
                      {currentStep > index + 1 ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : currentStep === index + 1 ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{step.name}</p>
                        <p className="text-xs opacity-75">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Service Mapping Display */}
                {parsedServices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-background/50 border border-primary/20"
                  >
                    <h4 className="font-medium text-foreground mb-2">Identified Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedServices.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {SERVICE_MAPPING[service as keyof typeof SERVICE_MAPPING]?.name || service}
                        </Badge>
                      ))}
                    </div>
                    {totalCost > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span className="text-success font-medium">Total Cost: ${totalCost.toFixed(2)}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Display */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 glass border-0">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="font-semibold text-foreground">Results</h3>
              </div>

              <div className="space-y-3">
                {results.map((result, index) => (
                  <motion.div
                    key={result.service}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${result.success
                      ? 'bg-success/10 border-success/20'
                      : 'bg-destructive/10 border-destructive/20'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {SERVICE_MAPPING[result.service as keyof typeof SERVICE_MAPPING]?.name || result.service}
                      </span>
                      <Badge variant={result.success ? 'default' : 'destructive'} className="text-xs">
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>

                    {result.success ? (
                      <pre className="text-xs text-muted-foreground bg-background/50 p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-xs text-destructive">{result.error}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Required UI */}
      <AnimatePresence>
        {paymentRequired && paymentDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary-light to-secondary-light">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Payment Required</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium text-lg">${(parseInt(paymentDetails.amount) / 1000000).toFixed(6)} USDC</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Services:</span>
                    <p className="font-medium">{parsedServices.length} services</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {parsedServices.map((service) => (
                    <Badge key={service} variant="outline" className="text-xs">
                      {SERVICE_MAPPING[service as keyof typeof SERVICE_MAPPING]?.name || service}
                    </Badge>
                  ))}
                </div>

                {paymentError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isPaymentProcessing || !userAddress || !signer}
                  className="w-full"
                  variant="gradient"
                  size="lg"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing Transaction...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Sign & Pay
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <Button
        onClick={() => {
          console.log('🔘 Button clicked! userIntent:', userIntent);
          console.log('🔘 isProcessing:', isProcessing);
          processIntent();
        }}
        disabled={!userIntent.trim() || isProcessing || !userAddress || !signer}
        className="w-full"
        variant="gradient"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : !userAddress || !signer ? (
          <>
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet First
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Process Intent
          </>
        )}
      </Button>
    </div>
  );
}
