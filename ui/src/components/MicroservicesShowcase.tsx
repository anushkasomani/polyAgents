import React from "react";
import { motion } from "framer-motion";
import { 
  Newspaper, 
  Cloud, 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Database, 
  Activity,
  Zap,
  DollarSign,
  Clock,
  CheckCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Available microservices from the demo/a2a/services directory
const availableServices = [
  {
    id: "news",
    name: "News Service",
    description: "Get cryptocurrency and financial news with sentiment analysis",
    icon: Newspaper,
    price: "$0.10",
    endpoint: "http://localhost:5404/news",
    features: ["Real-time crypto news", "Sentiment analysis", "Multi-source aggregation"],
    example: "Get latest BTC news and sentiment",
    status: "online"
  },
  {
    id: "weather",
    name: "Weather Service", 
    description: "Access weather data for any city worldwide",
    icon: Cloud,
    price: "$0.05",
    endpoint: "http://localhost:5405/weather",
    features: ["Global weather data", "Forecast information", "City-specific data"],
    example: "Get weather forecast for London",
    status: "online"
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyze market sentiment and social media trends",
    icon: Brain,
    price: "$0.15",
    endpoint: "http://localhost:5408/sentiment",
    features: ["Market sentiment", "Social media analysis", "Trend detection"],
    example: "Analyze BTC sentiment from social media",
    status: "online"
  },
  {
    id: "ohlcv",
    name: "OHLCV Data",
    description: "Get historical and real-time price data",
    icon: BarChart3,
    price: "$0.20",
    endpoint: "http://localhost:5406/ohlcv",
    features: ["Historical data", "Real-time prices", "Multiple timeframes"],
    example: "Get BTC price data for last 30 days",
    status: "online"
  },
  {
    id: "backtest",
    name: "Backtesting",
    description: "Run trading strategy backtests with historical data",
    icon: TrendingUp,
    price: "$0.50",
    endpoint: "http://localhost:5409/backtest",
    features: ["Strategy testing", "Performance metrics", "Risk analysis"],
    example: "Backtest a moving average strategy on ETH",
    status: "online"
  },
  {
    id: "oracle",
    name: "Oracle Service",
    description: "Access Chainlink price feeds and oracle data",
    icon: Database,
    price: "$0.25",
    endpoint: "http://localhost:5407/oracle",
    features: ["Chainlink feeds", "Price oracles", "DeFi data"],
    example: "Get Chainlink BTC/USD price feed",
    status: "online"
  },
  {
    id: "geckoterminal",
    name: "GeckoTerminal",
    description: "Access trending pools and DeFi analytics",
    icon: Activity,
    price: "$0.30",
    endpoint: "http://localhost:5404/geckoterminal",
    features: ["Trending pools", "DeFi analytics", "Liquidity data"],
    example: "Get trending pools on Polygon",
    status: "online"
  }
];

interface MicroservicesShowcaseProps {
  onServiceSelect?: (service: typeof availableServices[0]) => void;
}

export function MicroservicesShowcase({ onServiceSelect }: MicroservicesShowcaseProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Available Microservices
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose from our suite of specialized AI services, each accessible via x402 protocol with stablecoin payments
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableServices.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="p-6 glass border-0 hover:border-primary/20 transition-all duration-300 group cursor-pointer"
                  onClick={() => onServiceSelect?.(service)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.price}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-xs">
                    x402
                  </Badge>
                  <Badge 
                    variant={service.status === 'online' ? 'default' : 'secondary'}
                    className={`text-xs ${service.status === 'online' ? 'bg-success/10 text-success border-success/20' : ''}`}
                  >
                    {service.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              
              <div className="space-y-2 mb-4">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-success" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Example:</p>
                <p className="text-sm text-foreground font-medium">"{service.example}"</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Service Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="p-6 glass border-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{availableServices.length}</span>
          </div>
          <p className="text-sm text-muted-foreground">Available Services</p>
        </Card>
        
        <Card className="p-6 glass border-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold text-foreground">$0.05</span>
          </div>
          <p className="text-sm text-muted-foreground">Starting Price</p>
        </Card>
        
        <Card className="p-6 glass border-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-2xl font-bold text-foreground">&lt;2s</span>
          </div>
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
        </Card>
      </motion.div>
    </motion.section>
  );
}
