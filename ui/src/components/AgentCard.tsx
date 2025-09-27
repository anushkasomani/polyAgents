import { motion } from "framer-motion";
import { Star, Clock, DollarSign, Users, Zap, Brain, Code, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: "analysis" | "development" | "creative" | "research";
  rating: number;
  reviews: number;
  price: number;
  responseTime: string;
  availability: "online" | "busy" | "offline";
  tags: string[];
  icon?: React.ComponentType<{ className?: string }>;
}

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
  selected?: boolean;
}

const categoryIcons = {
  analysis: BarChart3,
  development: Code,
  creative: Zap,
  research: Brain,
};

const categoryColors = {
  analysis: "bg-primary/10 text-primary border-primary/20",
  development: "bg-secondary/10 text-secondary border-secondary/20",
  creative: "bg-accent/10 text-accent border-accent/20",
  research: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
};

const availabilityColors = {
  online: "bg-success text-success-foreground",
  busy: "bg-warning text-warning-foreground",
  offline: "bg-muted text-muted-foreground",
};

export function AgentCard({ agent, onSelect, selected }: AgentCardProps) {
  const CategoryIcon = categoryIcons[agent.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`agent-card p-6 rounded-xl cursor-pointer relative overflow-hidden ${
        selected ? "ring-2 ring-primary border-primary/30" : ""
      }`}
      onClick={() => onSelect(agent)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <CategoryIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground text-lg">{agent.name}</h3>
              <Badge variant="secondary" className={categoryColors[agent.category]}>
                {agent.category}
              </Badge>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`${availabilityColors[agent.availability]} border-0 px-2 py-1`}
          >
            <div className="w-2 h-2 rounded-full bg-current mr-1" />
            {agent.availability}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
          {agent.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {agent.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{agent.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium text-sm">{agent.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ({agent.reviews} reviews)
            </p>
          </div>
          
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-primary">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium text-sm">${agent.price}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">per task</p>
          </div>
          
          <div className="p-2 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-secondary">
              <Clock className="w-3 h-3" />
              <span className="font-medium text-sm">{agent.responseTime}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">response</p>
          </div>
        </div>

        {/* Select Button */}
        <Button 
          className={`w-full ${selected ? "bg-primary text-primary-foreground" : ""}`}
          variant={selected ? "default" : "outline"}
        >
          {selected ? "Selected" : "Select Agent"}
        </Button>
      </div>
    </motion.div>
  );
}