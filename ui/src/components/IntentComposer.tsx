import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, DollarSign, Clock, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface IntentComposerProps {
  onSubmit: (intent: {
    description: string;
    category: string;
    urgency: string;
    estimatedCost: number;
  }) => void;
}

const categories = [
  { value: "analysis", label: "Data Analysis", icon: "📊" },
  { value: "development", label: "Code Generation", icon: "💻" },
  { value: "creative", label: "Creative Tasks", icon: "🎨" },
  { value: "research", label: "Research & Writing", icon: "📚" },
];

const urgencyLevels = [
  { value: "low", label: "Low Priority", multiplier: 1, color: "text-muted-foreground" },
  { value: "medium", label: "Medium Priority", multiplier: 1.5, color: "text-warning" },
  { value: "high", label: "High Priority", multiplier: 2, color: "text-destructive" },
];

const examplePrompts = [
  "Analyze customer feedback data and provide insights",
  "Create a React component for user authentication",
  "Design a logo for my tech startup",
  "Write a comprehensive market research report",
  "Optimize my database queries for better performance",
];

export function IntentComposer({ onSubmit }: IntentComposerProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [estimatedCost, setEstimatedCost] = useState(0);

  const calculateCost = (desc: string, cat: string, urg: string) => {
    const basePrice = 25;
    const wordCount = desc.split(/\s+/).length;
    const wordMultiplier = Math.max(1, wordCount / 50);
    const urgencyMultiplier = urgencyLevels.find(u => u.value === urg)?.multiplier || 1;
    return Math.round(basePrice * wordMultiplier * urgencyMultiplier);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    const cost = calculateCost(value, category, urgency);
    setEstimatedCost(cost);
  };

  const handleSubmit = () => {
    if (!description.trim() || !category) return;
    
    onSubmit({
      description,
      category,
      urgency,
      estimatedCost,
    });
  };

  const selectedUrgency = urgencyLevels.find(u => u.value === urgency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Describe Your Intent
        </h2>
        <p className="text-muted-foreground">
          Tell us what you need, and we'll match you with the perfect AI agent
        </p>
      </div>

      {/* Example Prompts */}
      <Card className="p-4 bg-gradient-to-br from-primary-light to-secondary-light border-primary/20">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Example Intents</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.slice(0, 3).map((prompt, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleDescriptionChange(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-background/50 hover:bg-background/80 text-foreground border border-primary/20 transition-all"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </Card>

      {/* Intent Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Intent Description
        </label>
        <Textarea
          placeholder="Describe what you want the AI to help you with..."
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          className="min-h-[120px] resize-none border-primary/20 focus:border-primary/40"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{description.split(/\s+/).length} words</span>
          <span>More detailed descriptions yield better results</span>
        </div>
      </div>

      {/* Category & Urgency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="border-primary/20 focus:border-primary/40">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Priority Level
          </label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="border-primary/20 focus:border-primary/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <span className={level.color}>{level.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cost Estimation */}
      {estimatedCost > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg glass border"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Estimated Cost</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                ${estimatedCost}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedUrgency?.label}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Estimated completion: 2-4 hours</span>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!description.trim() || !category}
        className="w-full"
        variant="gradient"
        size="lg"
      >
        <Sparkles className="w-4 h-4" />
        Find Perfect Agent
      </Button>
    </motion.div>
  );
}