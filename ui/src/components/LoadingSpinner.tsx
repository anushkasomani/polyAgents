import { motion } from "framer-motion";
import { Brain, Zap, Database } from "lucide-react";

interface LoadingSpinnerProps {
  variant?: "default" | "neural" | "processing";
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ 
  variant = "default", 
  size = "md", 
  text 
}: LoadingSpinnerProps) {
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };

  if (variant === "neural") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Central node */}
          <motion.div
            className={`${sizeClasses[size]} rounded-full bg-gradient-primary flex items-center justify-center`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Brain className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-6 h-6" : "w-8 h-8"} text-primary-foreground`} />
          </motion.div>

          {/* Orbiting nodes */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-secondary rounded-full"
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              animate={{
                rotate: 360,
                x: [-20, 20, -20],
                y: [-20, 20, -20],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5,
                ease: "linear",
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            className="text-sm text-muted-foreground text-center"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "processing") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          {[Database, Zap, Brain].map((Icon, index) => (
            <motion.div
              key={index}
              className="p-3 rounded-lg bg-muted/50"
              animate={{
                scale: [1, 1.1, 1],
                backgroundColor: [
                  "hsl(var(--muted))",
                  "hsl(var(--primary) / 0.1)",
                  "hsl(var(--muted))",
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              <Icon className="w-6 h-6 text-primary" />
            </motion.div>
          ))}
        </div>
        {text && (
          <p className="text-sm text-muted-foreground text-center">
            {text}
          </p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className={`${sizeClasses[size]} border-4 border-muted border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {text && (
        <p className="text-sm text-muted-foreground text-center">
          {text}
        </p>
      )}
    </div>
  );
}