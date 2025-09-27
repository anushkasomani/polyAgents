import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, DollarSign, Clock, Lightbulb, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useX402 } from "@/hooks/useX402";
import { X402_SERVICES, ServiceEndpoint } from "@/lib/x402-client";
import { Hex } from "viem";

interface X402IntentComposerProps {
  onSubmit: (intent: {
    description: string;
    category: string;
    urgency: string;
    estimatedCost: number;
    serviceEndpoint: ServiceEndpoint;
  }) => void;
  onPaymentResult?: (result: { success: boolean; data?: any; error?: string }) => void;
}

const categories = [
  { value: "analysis", label: "Data Analysis", icon: "📊", endpoint: X402_SERVICES.AI_ANALYSIS },
  { value: "development", label: "Code Generation", icon: "💻", endpoint: X402_SERVICES.CODE_GENERATION },
  { value: "creative", label: "Creative Tasks", icon: "🎨", endpoint: X402_SERVICES.CREATIVE_TASKS },
  { value: "research", label: "Research & Writing", icon: "📚", endpoint: X402_SERVICES.RESEARCH },
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

export function X402IntentComposer({ onSubmit, onPaymentResult }: X402IntentComposerProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [privateKey, setPrivateKey] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, error, requestService, initializeClient } = useX402();

  const calculateCost = (desc: string, cat: string, urg: string) => {
    const basePrice = 25;
    const wordCount = desc.split(/\s+/).length;
    const wordMultiplier = Math.max(1, wordCount / 50);
    const urgencyMultiplier = urgencyLevels.find(u => u.value === urg)?.multiplier || 1;
    return Math.ceil(basePrice * wordMultiplier * urgencyMultiplier);
  };

  useEffect(() => {
    if (description && category && urgency) {
      setEstimatedCost(calculateCost(description, category, urgency));
    }
  }, [description, category, urgency]);

  const handleSubmit = async () => {
    if (!description.trim() || !category || !privateKey.trim()) return;

    const selectedCategory = categories.find(c => c.value === category);
    if (!selectedCategory) return;

    setIsSubmitting(true);

    try {
      // Initialize X402 client with private key
      if (!initializeClient(privateKey as Hex)) {
        throw new Error('Failed to initialize X402 client');
      }

      // Create the intent data
      const intentData = {
        description: description.trim(),
        category,
        urgency,
        estimatedCost,
        timestamp: new Date().toISOString(),
      };

      // Make payment request to X402 service
      const result = await requestService(
        selectedCategory.endpoint,
        intentData,
        privateKey as Hex
      );

      if (result.success) {
        onSubmit({
          description,
          category,
          urgency,
          estimatedCost,
          serviceEndpoint: selectedCategory.endpoint,
        });

        onPaymentResult?.({
          success: true,
          data: result.data,
        });

        // Reset form on success
        setDescription("");
        setCategory("");
        setUrgency("medium");
        setEstimatedCost(0);
      } else {
        onPaymentResult?.({
          success: false,
          error: result.error || 'Payment failed',
        });
      }
    } catch (err) {
      onPaymentResult?.({
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillExample = (prompt: string) => {
    setDescription(prompt);
    // Auto-select category based on prompt content
    if (prompt.includes('data') || prompt.includes('analysis')) setCategory('analysis');
    else if (prompt.includes('React') || prompt.includes('code')) setCategory('development');
    else if (prompt.includes('design') || prompt.includes('logo')) setCategory('creative');
    else if (prompt.includes('research') || prompt.includes('report')) setCategory('research');
  };

  return (
    <Card className="p-6 glass border-0">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Create Your Intent
          </h2>
          <p className="text-muted-foreground">
            Describe what you need, and we'll connect you with the right AI service
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Example Prompts */}
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Quick Start Examples:</Label>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => fillExample(prompt)}
                className="text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                {prompt.substring(0, 30)}...
              </Button>
            ))}
          </div>
        </div>

        {/* Private Key Input */}
        <div className="space-y-2">
          <Label htmlFor="privateKey">Wallet Private Key</Label>
          <Input
            id="privateKey"
            type="password"
            placeholder="Enter your wallet private key for X402 payments"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="glass"
          />
          <p className="text-xs text-muted-foreground">
            This is used to make payments through the X402 protocol. Your key is not stored.
          </p>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <Label htmlFor="description">Describe Your Request</Label>
          <Textarea
            id="description"
            placeholder="What do you need help with? Be as specific as possible..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 glass resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{description.length}/1000 characters</span>
            <span>{description.split(/\s+/).length} words</span>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label>Service Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="glass">
              <SelectValue placeholder="Select a service category" />
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

        {/* Urgency Selection */}
        <div className="space-y-2">
          <Label>Priority Level</Label>
          <Select value={urgency} onValueChange={setUrgency}>
            <SelectTrigger className="glass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex items-center justify-between w-full">
                    <span className={level.color}>{level.label}</span>
                    <span className="text-xs">×{level.multiplier}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cost Estimation */}
        {estimatedCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg glass border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-success" />
                <span className="font-medium">Estimated Cost</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-success">
                  ${(estimatedCost / 100).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  via X402 Protocol
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={
            !description.trim() || 
            !category || 
            !privateKey.trim() || 
            isLoading || 
            isSubmitting
          }
          className="w-full"
          size="lg"
        >
          {(isLoading || isSubmitting) ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
            </motion.div>
          ) : (
            <Wallet className="w-4 h-4 mr-2" />
          )}
          {(isLoading || isSubmitting) ? 'Processing Payment...' : 'Submit & Pay'}
        </Button>
      </div>
    </Card>
  );
}