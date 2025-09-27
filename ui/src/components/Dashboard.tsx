import { useState } from "react";
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
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletConnector } from "@/components/WalletConnector";
import { AgentCard, type Agent } from "@/components/AgentCard";
import { IntentComposer } from "@/components/IntentComposer";
import heroImage from "@/assets/ai-network-hero.png";

interface DashboardProps {
  onStartIntent: () => void;
}

const featuredAgents: Agent[] = [
  {
    id: "1",
    name: "DataMind Pro",
    description: "Advanced analytics and data visualization specialist. Transforms raw data into actionable insights with beautiful charts and comprehensive reports.",
    category: "analysis",
    rating: 4.9,
    reviews: 1247,
    price: 45,
    responseTime: "< 30min",
    availability: "online",
    tags: ["Analytics", "Visualization", "Reports", "Machine Learning"],
  },
  {
    id: "2", 
    name: "CodeCraft AI",
    description: "Full-stack development expert specializing in React, Node.js, and modern web technologies. Creates clean, production-ready code.",
    category: "development",
    rating: 4.8,
    reviews: 892,
    price: 60,
    responseTime: "< 1hr",
    availability: "online",
    tags: ["React", "TypeScript", "API Development", "Testing"],
  },
  {
    id: "3",
    name: "Creative Genius",
    description: "Innovative design and content creation specialist. From logos to marketing copy, brings creative visions to life with AI precision.",
    category: "creative",
    rating: 4.7,
    reviews: 654,
    price: 35,
    responseTime: "< 45min",
    availability: "busy",
    tags: ["Design", "Branding", "Content", "Marketing"],
  },
];

const recentActivity = [
  { id: 1, action: "Data analysis completed", agent: "DataMind Pro", time: "2 hours ago", status: "completed" },
  { id: 2, action: "Code review in progress", agent: "CodeCraft AI", time: "1 hour ago", status: "processing" },
  { id: 3, action: "Logo design delivered", agent: "Creative Genius", time: "4 hours ago", status: "completed" },
];

const stats = [
  { label: "Total Tasks", value: "1,247", icon: Target, color: "text-primary" },
  { label: "Active Agents", value: "48", icon: Users, color: "text-secondary" },
  { label: "Avg. Response", value: "< 35min", icon: Clock, color: "text-accent" },
  { label: "Success Rate", value: "99.2%", icon: TrendingUp, color: "text-success" },
];

export function Dashboard({ onStartIntent }: DashboardProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showIntentComposer, setShowIntentComposer] = useState(false);

  const handleIntentSubmit = (intent: any) => {
    console.log("Intent submitted:", intent);
    // Handle intent submission
    setShowIntentComposer(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">AI Service Hub</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Activity className="w-4 h-4" />
                Activity
              </Button>
              <WalletConnector />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative">
            <img 
              src={heroImage} 
              alt="AI Network" 
              className="mx-auto mb-6 w-full max-w-2xl h-48 object-contain neural-pulse"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Connect, Create, 
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Transform</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access a network of specialized AI agents ready to tackle your most complex challenges. 
            From data analysis to creative design, get professional results in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => setShowIntentComposer(true)}
            >
              <Sparkles className="w-5 h-5" />
              Start New Intent
            </Button>
            <Button variant="outline" size="xl">
              <Users className="w-5 h-5" />
              Browse Agents
            </Button>
          </div>
        </motion.section>

        {/* Stats Grid */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="p-4 glass border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Featured Agents */}
          <motion.section 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-foreground">Featured Agents</h3>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4" />
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

          {/* Recent Activity */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-foreground mb-6">Recent Activity</h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-medium transition-all cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'completed' ? 'bg-success' : 
                        activity.status === 'processing' ? 'bg-warning pulse-ring' : 'bg-muted'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.agent}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className={activity.status === 'completed' ? 'bg-success/10 text-success border-success/20' : ''}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-6">
              View All Activity
            </Button>
          </motion.section>
        </div>
      </div>

      {/* Intent Composer Modal */}
      <AnimatePresence>
        {showIntentComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIntentComposer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <IntentComposer onSubmit={handleIntentSubmit} />
              <Button
                variant="ghost"
                onClick={() => setShowIntentComposer(false)}
                className="mt-4 w-full"
              >
                Cancel
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}