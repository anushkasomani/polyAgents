import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  Database, 
  Cpu, 
  Network, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProcessingStep {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed" | "error";
  duration?: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface ProcessingDashboardProps {
  intentId: string;
  onComplete?: (result: any) => void;
}

const processingSteps: ProcessingStep[] = [
  {
    id: "analyze",
    name: "Intent Analysis",
    status: "completed",
    duration: 1200,
    icon: Brain,
    description: "Understanding your request and matching optimal agents",
  },
  {
    id: "allocate",
    name: "Resource Allocation",
    status: "processing",
    icon: Network,
    description: "Deploying microservices and initializing processing nodes",
  },
  {
    id: "process",
    name: "AI Processing",
    status: "pending",
    icon: Cpu,
    description: "Executing specialized algorithms and generating results",
  },
  {
    id: "validate",
    name: "Quality Validation",
    status: "pending",
    icon: CheckCircle,
    description: "Verifying output quality and ensuring accuracy",
  },
  {
    id: "deliver",
    name: "Result Delivery",
    status: "pending",
    icon: Download,
    description: "Packaging and delivering your completed results",
  },
];

export function ProcessingDashboard({ intentId, onComplete }: ProcessingDashboardProps) {
  const [steps, setSteps] = useState(processingSteps);
  const [progress, setProgress] = useState(25);
  const [estimatedTime, setEstimatedTime] = useState(180); // seconds
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Simulate processing progression
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const currentProcessing = newSteps.findIndex(s => s.status === "processing");
        
        if (currentProcessing !== -1 && Math.random() > 0.95) {
          // Complete current step and start next
          newSteps[currentProcessing].status = "completed";
          if (currentProcessing < newSteps.length - 1) {
            newSteps[currentProcessing + 1].status = "processing";
          }
          
          // Update progress
          const completedCount = newSteps.filter(s => s.status === "completed").length;
          setProgress((completedCount / newSteps.length) * 100);
          
          // Check if all completed
          if (completedCount === newSteps.length) {
            onComplete?.({ success: true, result: "Processing completed successfully" });
          }
        }
        
        return newSteps;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'processing': return 'text-primary';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertCircle;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Processing Your Intent
          </h1>
          <p className="text-muted-foreground">
            Intent ID: <code className="bg-muted px-2 py-1 rounded text-sm">{intentId}</code>
          </p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="p-6 glass border-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Overall Progress</h2>
                <p className="text-muted-foreground">
                  Elapsed: {formatTime(elapsedTime)} / Est: {formatTime(estimatedTime)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Processing
                </Badge>
              </div>
            </div>
            
            <Progress value={progress} className="h-3" />
          </Card>
        </motion.div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {steps.map((step, index) => {
              const StatusIcon = getStatusIcon(step.status);
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-4 transition-all duration-medium ${
                    step.status === 'processing' ? 'ring-2 ring-primary/50 shadow-glass' : ''
                  }`}>
                    <div className="flex items-center gap-4">
                      {/* Step Icon */}
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-success/10' :
                        step.status === 'processing' ? 'bg-primary/10 pulse-ring' :
                        step.status === 'error' ? 'bg-destructive/10' :
                        'bg-muted/50'
                      }`}>
                        <step.icon className={`w-6 h-6 ${getStatusColor(step.status)}`} />
                      </div>

                      {/* Step Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground">{step.name}</h3>
                          {StatusIcon && (
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(step.status)}`} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>

                      {/* Processing Animation */}
                      {step.status === 'processing' && (
                        <div className="flex space-x-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Neural Network Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="p-6 glass border-0 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Neural Network Activity
            </h3>
            <div className="relative">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 neural-pulse flex items-center justify-center">
                <Database className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-64 h-64 border border-primary/30 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Processing nodes are actively collaborating on your request
            </p>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline">
            Cancel Processing
          </Button>
          <Button variant="ghost">
            <Share2 className="w-4 h-4" />
            Share Progress
          </Button>
        </div>
      </div>
    </div>
  );
}