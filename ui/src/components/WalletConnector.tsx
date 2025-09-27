import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface WalletConnectorProps {
  onConnect?: (address: string) => void;
}

const mockWallets = [
  { name: "MetaMask", icon: "🦊", installed: true },
  { name: "Coinbase", icon: "🔷", installed: true },
  { name: "Trust Wallet", icon: "🛡️", installed: false },
  { name: "WalletConnect", icon: "🔗", installed: true },
];

export function WalletConnector({ onConnect }: WalletConnectorProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("1,234.56");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletName: string) => {
    // Simulate wallet connection
    const mockAddress = "0x1234...5678";
    setAddress(mockAddress);
    setIsConnected(true);
    setIsOpen(false);
    onConnect?.(mockAddress);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected) {
    return (
      <motion.div 
        className="flex items-center gap-3 p-3 rounded-lg glass border"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {address}
            </span>
            <button
              onClick={copyAddress}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            ${balance} USDC
          </p>
        </div>
        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
          Connected
        </Badge>
      </motion.div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass border-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <AnimatePresence>
            {mockWallets.map((wallet, index) => (
              <motion.button
                key={wallet.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleConnect(wallet.name)}
                disabled={!wallet.installed}
                className="w-full p-4 rounded-lg border bg-card hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-medium flex items-center gap-3 group"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    {wallet.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {wallet.installed ? "Available" : "Not installed"}
                  </p>
                </div>
                {!wallet.installed && (
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
        </div>
      </DialogContent>
    </Dialog>
  );
}