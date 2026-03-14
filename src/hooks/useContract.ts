'use client';
import { useState, useCallback } from 'react';
import { createReadClient, createWriteClient, CONTRACT_ADDRESS } from '@/lib/genlayer';

export function useContract() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const read = async (fn: string, args: any[] = []) => {
    const client = createReadClient();
    const res = await client.readContract({ address: CONTRACT_ADDRESS, functionName: fn, args } as any);
    console.log(`read ${fn}:`, res);
    return typeof res === 'string' ? JSON.parse(res) : res;
  };

  const write = async (wallet: string, fn: string, args: any[], msg: string) => {
    setLoading(true);
    setStatus(msg);
    try {
      const client = createWriteClient(wallet);
      const hash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName: fn, args, value: BigInt(0) } as any);
      setStatus('Waiting for validators...');
      const receipt = await client.waitForTransactionReceipt({ hash, retries: 300, interval: 5000 } as any);
      setStatus('Done!');
      setTimeout(() => setStatus(''), 3000);
      setLoading(false);
      return receipt;
    } catch (e: any) {
      setStatus('');
      setLoading(false);
      throw e;
    }
  };

  return {
    loading, status,
    getClues: useCallback(() => read('get_current_clues'), []),
    getDailyClues: useCallback(() => read('get_daily_challenge_clues'), []),
    getStats: useCallback(() => read('get_stats'), []),
    isActive: useCallback(() => read('get_current_round_active'), []),
    getLastResult: useCallback(() => read('get_last_guess_result'), []),
    generateRound: useCallback((url: string, diff: string, w: string) => write(w, 'generate_round', [url, diff], 'AI analyzing image...'), []),
    submitGuess: useCallback((guess: string, w: string) => write(w, 'submit_guess', [guess], 'AI validating guess...'), []),
    createDaily: useCallback((date: string, url: string, w: string) => write(w, 'create_daily_challenge', [date, url], 'Creating daily challenge...'), []),
    submitDailyGuess: useCallback((guess: string, w: string) => write(w, 'submit_daily_guess', [guess], 'AI validating...'), []),
    startSeason: useCallback((id: number, s: string, e: string, w: string) => write(w, 'start_season', [id, s, e], 'Starting season...'), []),
  };
}
