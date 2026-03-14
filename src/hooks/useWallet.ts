'use client';
import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window { ethereum?: any; }
}

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accs: string[]) => {
        if (accs.length > 0) setAddress(accs[0]);
      }).catch(() => {});
      window.ethereum.on('accountsChanged', (accs: string[]) => {
        setAddress(accs.length > 0 ? accs[0] : null);
      });
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) return alert('Install MetaMask!');
    setConnecting(true);
    try {
      const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAddress(accs[0]);
    } catch {}
    setConnecting(false);
  }, []);

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  return { address, short, connecting, connect, isConnected: !!address };
}
