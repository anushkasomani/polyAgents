import { motion } from "framer-motion";
import { Star, Clock, DollarSign, Users, Zap, Brain, Code, BarChart3, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: "analysis" | "development" | "creative" | "research" | "oracle" | "analytics";
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
  oracle: BarChart3,
  analytics: BarChart3,
};

const categoryColors = {
  analysis: "bg-primary/10 text-primary border-primary/20",
  development: "bg-secondary/10 text-secondary border-secondary/20",
  creative: "bg-accent/10 text-accent border-accent/20",
  research: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  oracle: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  analytics: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
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
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${selected
          ? "ring-2 ring-primary/50 border-primary/30 shadow-xl shadow-primary/10"
          : "border-border/50 hover:border-border shadow-lg hover:shadow-xl"
        }`}
      onClick={() => onSelect(agent)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-300">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <CategoryIcon className="w-7 h-7 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-xl group-hover:text-primary transition-colors duration-300">
                {agent.name}
              </h3>
              <Badge variant="secondary" className={`${categoryColors[agent.category]} font-medium px-3 py-1`}>
                {agent.category}
              </Badge>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`${availabilityColors[agent.availability]} border-0 px-3 py-1.5 font-medium shadow-sm`}
          >
            <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
            {agent.availability}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-5 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {agent.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {agent.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-1 hover:bg-primary/10 transition-colors duration-200">
              {tag}
            </Badge>
          ))}
          {agent.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground px-2 py-1">
              +{agent.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border border-yellow-200/50 dark:border-yellow-800/20 group-hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-bold text-sm">{agent.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {agent.reviews.toLocaleString()} reviews
            </p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border border-green-200/50 dark:border-green-800/20 group-hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold text-sm">${agent.price}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">per request</p>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-800/20 group-hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-bold text-sm">{agent.responseTime}</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">avg response</p>
          </div>
        </div>

        {/* Select Button */}
        <Button
          className={`w-full h-11 font-semibold transition-all duration-300 ${selected
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
            }`}
          variant={selected ? "default" : "outline"}
        >
          {selected ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Selected
            </>
          ) : (
            "Select Service"
          )}
        </Button>
      </div>
    </motion.div>
  );
}