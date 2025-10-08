"use client";
import React, { useEffect, useState } from 'react';

// Minimal WalletConnect-like connector using window.ethereum if available.
// This keeps the UI in place; full WalletConnect v2 integration can be added later.

export default function WalletConnectButton({ onConnect }: { onConnect?: (addr: string) => void }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if ((window as any).ethereum && (window as any).ethereum.selectedAddress) {
      setConnected(true);
      setAddress((window as any).ethereum.selectedAddress);
    }
    // listen for account changes
    const handler = (accounts: string[]) => {
      if (accounts && accounts.length) {
        setConnected(true);
        setAddress(accounts[0]);
        onConnect?.(accounts[0]);
      } else {
        setConnected(false);
        setAddress(null);
      }
    };
    try {
      (window as any).ethereum?.on?.('accountsChanged', handler);
    } catch (e) { }
    return () => {
      try { (window as any).ethereum?.removeListener?.('accountsChanged', handler); } catch (e) { }
    };
  }, [onConnect]);

  async function connect() {
    if (!(window as any).ethereum) {
      // prompt user to install a wallet or use WalletConnect later
      window.open('https://metamask.io/', '_blank');
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length) {
        setConnected(true);
        setAddress(accounts[0]);
        onConnect?.(accounts[0]);
      }
    } catch (e) {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={connect} style={{ backgroundColor: 'var(--accent)' }} className="px-3 py-2 text-white rounded-md text-sm hover:opacity-95">
        {connected ? 'Connected' : 'Connect Wallet'}
      </button>
      {address ? (
        <div className="text-sm text-gray-200 bg-white/5 px-2 py-1 rounded">{address.slice(0, 6)}...{address.slice(-4)}</div>
      ) : null}
    </div>
  );
}
