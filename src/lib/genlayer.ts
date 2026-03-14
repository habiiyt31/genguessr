import { createClient } from 'genlayer-js';
// import { simulator } from 'genlayer-js/chains';

export const CONTRACT_ADDRESS = '0xB8ed0850d674Fea7D4CEDf7261c703d92B6808b3';
const STUDIO_ENDPOINT = 'https://studio.genlayer.com/api';

export function createReadClient() {
  return createClient({
    endpoint: STUDIO_ENDPOINT,
  });
}

export function createWriteClient(walletAddress: string) {
  return createClient({
    endpoint: STUDIO_ENDPOINT,
    account: walletAddress as `0x${string}`,
  });
}
