import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  ChevronRight,
  Brain,
  Zap,
  Target,
  Activity,
  Wallet,
  ArrowRight,
  Play,
  Shield,
  Layers,
  Cpu,
  Network,
  Globe,
  Lock,
  CheckCircle2,
  Star,
  BarChart3,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletConnector } from "@/components/WalletConnector";
import { AgentCard, type Agent } from "@/components/AgentCard";
import { IntentComposer } from "@/components/IntentComposer";
import { MicroservicesShowcase } from "@/components/MicroservicesShowcase";
import { IntentProcessor } from "@/components/IntentProcessor";
import { IntegrationTest } from "@/components/IntegrationTest";
import { SimpleIntentTest } from "@/components/SimpleIntentTest";
import { MetaMaskTest } from "@/components/MetaMaskTest";

interface DashboardProps {
  onStartIntent: () => void;
}

const featuredAgents: Agent[] = [
  {
    id: "1",
    name: "Polygon Oracle Network",
    description: "Real-time blockchain data aggregation and price feeds. Provides secure, decentralized oracle services for DeFi protocols with sub-second latency.",
    category: "oracle",
    rating: 4.9,
    reviews: 2847,
    price: 0.25,
    responseTime: "< 2s",
    availability: "online",
    tags: ["Oracle", "Price Feeds", "DeFi", "Real-time"],
  },
  {
    id: "2",
    name: "Sentiment Intelligence",
    description: "Advanced NLP models analyzing crypto market sentiment from social media, news, and trading patterns. Delivers actionable market insights.",
    category: "analytics",
    rating: 4.8,
    reviews: 1923,
    price: 0.15,
    responseTime: "< 30s",
    availability: "online",
    tags: ["NLP", "Sentiment", "Trading", "Social Media"],
  },
  {
    id: "3",
    name: "GeckoTerminal Analytics",
    description: "Comprehensive DEX analytics and trending token discovery. Track liquidity pools, volume patterns, and emerging opportunities across Polygon.",
    category: "analytics",
    rating: 4.7,
    reviews: 1456,
    price: 0.30,
    responseTime: "< 15s",
    availability: "online",
    tags: ["DEX", "Analytics", "Trending", "Liquidity"],
  },
];

const recentActivity = [
  { id: 1, action: "BTC price feed updated", agent: "Polygon Oracle Network", time: "2 minutes ago", status: "completed" },
  { id: 2, action: "Market sentiment analysis", agent: "Sentiment Intelligence", time: "5 minutes ago", status: "completed" },
  { id: 3, action: "DEX liquidity scan", agent: "GeckoTerminal Analytics", time: "8 minutes ago", status: "completed" },
];

const stats = [
  { label: "Total Requests", value: "12,847", icon: Target, color: "text-primary" },
  { label: "Active Services", value: "7", icon: Cpu, color: "text-secondary" },
  { label: "Avg. Response", value: "< 2.3s", icon: Clock, color: "text-accent" },
  { label: "Uptime", value: "99.97%", icon: TrendingUp, color: "text-success" },
];

export function Dashboard({ onStartIntent }: DashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showIntentComposer, setShowIntentComposer] = useState(false);
  const [showIntentProcessor, setShowIntentProcessor] = useState(false);
  const [showMicroservices, setShowMicroservices] = useState(false);
  const [showIntegrationTest, setShowIntegrationTest] = useState(false);
  const [showSimpleTest, setShowSimpleTest] = useState(false);
  const [showMetaMaskTest, setShowMetaMaskTest] = useState(false);
  const [processingResults, setProcessingResults] = useState<any[]>([]);
  const [userAddress, setUserAddress] = useState<string>("");
  const [signer, setSigner] = useState<any>(null);

  const handleIntentSubmit = (intent: any) => {
    console.log("Intent submitted:", intent);
    // Handle intent submission
    setShowIntentComposer(false);
  };

  const handleProcessingResults = (results: any[]) => {
    setProcessingResults(results);
    console.log("Processing results:", results);
  };

  const handleProcessingError = (error: string) => {
    console.error("Processing error:", error);
  };

  const handleWalletConnect = (address: string, walletSigner?: any) => {
    setUserAddress(address);
    setSigner(walletSigner);
    console.log("Wallet connected:", address);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <Network className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">X402 Protocol</h1>
                <p className="text-sm text-muted-foreground">Polygon Microservices Network</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <div className="w-2 h-2 bg-success rounded-full mr-2 animate-pulse" />
                Network Active
              </Badge>
              <WalletConnector onConnect={handleWalletConnect} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Hero Visual */}
          <div className="relative mb-12">
            <div className="relative mx-auto w-full max-w-4xl">
              {/* Central Network Visualization */}
              <div className="relative w-full h-64 flex items-center justify-center">
                <div className="relative">
                  {/* Central Hub */}
                  <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl animate-pulse">
                    <Network className="w-10 h-10 text-primary-foreground" />
                  </div>
                  
                  {/* Orbiting Services */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center shadow-lg">
                      <Cpu className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8 w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                    <defs>
                      <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    <line x1="100" y1="100" x2="100" y2="20" stroke="url(#connectionGradient)" strokeWidth="2" className="animate-pulse" />
                    <line x1="100" y1="100" x2="100" y2="180" stroke="url(#connectionGradient)" strokeWidth="2" className="animate-pulse delay-500" />
                    <line x1="100" y1="100" x2="20" y2="100" stroke="url(#connectionGradient)" strokeWidth="2" className="animate-pulse delay-1000" />
                    <line x1="100" y1="100" x2="180" y2="100" stroke="url(#connectionGradient)" strokeWidth="2" className="animate-pulse delay-1500" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Decentralized
              <span className="bg-gradient-primary bg-clip-text text-transparent block">Microservices</span>
              <span className="text-4xl md:text-5xl block mt-2">on Polygon</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Pay-per-use blockchain microservices with instant settlement. 
              <span className="text-foreground font-semibold"> Oracle feeds, sentiment analysis, DEX analytics</span> — 
              all powered by the X402 payment protocol.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              variant="gradient"
              size="xl"
              onClick={() => setShowIntentProcessor(true)}
              className="group relative overflow-hidden"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Launch Intent
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => setShowMicroservices(true)}
              className="group"
            >
              <Layers className="w-5 h-5 mr-2" />
              Explore Services
            </Button>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl glass border border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">USDC on Polygon</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl glass border border-secondary/20">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">Instant Execution</h3>
                <p className="text-sm text-muted-foreground">Sub-second response</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl glass border border-accent/20">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">99.97% Uptime</h3>
                <p className="text-sm text-muted-foreground">Reliable infrastructure</p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="p-6 glass border-0 hover:shadow-medium transition-all duration-medium group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color === 'text-primary' ? 'from-primary/20 to-primary/10' : stat.color === 'text-secondary' ? 'from-secondary/20 to-secondary/10' : stat.color === 'text-accent' ? 'from-accent/20 to-accent/10' : 'from-success/20 to-success/10'} group-hover:scale-110 transition-transform duration-medium`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">{stat.value}</p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.section>

        {/* Microservices Showcase */}
        <MicroservicesShowcase
          onServiceSelect={(service) => {
            console.log("Service selected:", service);
            setShowMicroservices(false);
            setShowIntentProcessor(true);
          }}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Services */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-foreground mb-2">Live Services</h3>
                <p className="text-muted-foreground">Real-time blockchain microservices</p>
              </div>
              <Button variant="outline" size="sm" className="group">
                View All <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid gap-6">
              {featuredAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <AgentCard
                    agent={agent}
                    onSelect={setSelectedAgent}
                    selected={selectedAgent?.id === agent.id}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Network Activity */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">Network Activity</h3>
              <p className="text-muted-foreground">Real-time service executions</p>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-medium transition-all cursor-pointer group border border-success/20 hover:border-success/40">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-success mt-1 animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-success/30 animate-ping" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.agent}
                        </p>
                        <p className="text-xs text-success font-medium mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20 text-xs"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {activity.status}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-6 group">
              <Activity className="w-4 h-4 mr-2" />
              View All Activity
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.section>
        </div>
      </div>

      {/* Intent Processor Modal */}
      <AnimatePresence>
        {showIntentProcessor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIntentProcessor(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <IntentProcessor
                onResults={handleProcessingResults}
                onError={handleProcessingError}
                userAddress={userAddress}
                signer={signer}
              />
              <Button
                variant="ghost"
                onClick={() => setShowIntentProcessor(false)}
                className="mt-4 w-full"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Microservices Modal */}
      <AnimatePresence>
        {showMicroservices && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMicroservices(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Available Microservices</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowMicroservices(false)}
                  className="p-2"
                >
                  ×
                </Button>
              </div>
              <MicroservicesShowcase
                onServiceSelect={(service) => {
                  console.log("Service selected:", service);
                  setShowMicroservices(false);
                  setShowIntentProcessor(true);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integration Test Modal */}
      <AnimatePresence>
        {showIntegrationTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIntegrationTest(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Integration Test Suite</h2>
                <Button
                  variant="ghost"
                  onClick={() => setShowIntegrationTest(false)}
                  className="p-2"
                >
                  ×
                </Button>
              </div>
              <IntegrationTest />
            </motion.div>
          </motion.div>
        )}

        {/* Simple Test Modal */}
        <AnimatePresence>
          {showSimpleTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSimpleTest(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-2xl font-bold text-foreground">Simple Intent Test</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowSimpleTest(false)}
                    className="p-2"
                  >
                    ×
                  </Button>
                </div>
                <div className="p-6">
                  <SimpleIntentTest />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MetaMask Test Modal */}
        <AnimatePresence>
          {showMetaMaskTest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowMetaMaskTest(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-2xl font-bold text-foreground">MetaMask Connection Test</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowMetaMaskTest(false)}
                    className="p-2"
                  >
                    ×
                  </Button>
                </div>
                <div className="p-6">
                  <MetaMaskTest />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

