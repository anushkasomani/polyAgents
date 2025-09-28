import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, ExternalLink, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WalletConnectorProps {
  onConnect?: (address: string, signer?: any) => void;
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
  const [error, setError] = useState<string | null>(null);
  const [signer, setSigner] = useState<any>(null);

  // Check if MetaMask is available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      // MetaMask is available
      const ethereum = (window as any).ethereum;
      if (ethereum.isMetaMask) {
        // Check if already connected
        ethereum.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAddress(accounts[0]);
              setIsConnected(true);
              onConnect?.(accounts[0], ethereum);
            }
          })
          .catch(console.error);
      }
    }
  }, [onConnect]);

  const handleConnect = async (walletName: string) => {
    setError(null);

    if (walletName === "MetaMask") {
      try {
        if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error("MetaMask not detected. Please install MetaMask extension.");
        }

        const ethereum = (window as any).ethereum;

        // Request account access
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length === 0) {
          throw new Error("No accounts found. Please create an account in MetaMask.");
        }

        const userAddress = accounts[0];
        setAddress(userAddress);
        setIsConnected(true);
        setSigner(ethereum);
        setIsOpen(false);

        // Get balance (simplified - in real app you'd get USDC balance)
        try {
          const balance = await ethereum.request({
            method: 'eth_getBalance',
            params: [userAddress, 'latest']
          });
          const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
          setBalance(balanceInEth.toFixed(4));
        } catch (e) {
          setBalance("0.0000");
        }

        onConnect?.(userAddress, ethereum);
      } catch (err: any) {
        setError(err.message || "Failed to connect wallet");
        console.error("Wallet connection error:", err);
      }
    } else {
      // For other wallets, use mock connection for demo
      const mockAddress = "0x1234...5678";
      setAddress(mockAddress);
      setIsConnected(true);
      setIsOpen(false);
      onConnect?.(mockAddress, null);
    }
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

        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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