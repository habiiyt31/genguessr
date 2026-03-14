# GenGuessr 

Full-stack on-chain AI guessing game built on GenLayer.

## Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: GenLayer Testnet Bradbury
- **Contract**: GenGuessr Intelligent Contract
- **Wallet**: MetaMask
- **SDK**: GenLayerJS

## Contract Address

```
0xB8ed0850d674Fea7D4CEDf7261c703d92B6808b3
```

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect GitHub repo to Vercel dashboard.

## Deploy to Google Cloud Run

```bash
# Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT/genguessr

# Deploy
gcloud run deploy genguessr \
  --image gcr.io/YOUR_PROJECT/genguessr \
  --platform managed \
  --allow-unauthenticated
```

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Tailwind + custom styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main game page
├── hooks/
│   ├── useWallet.ts      # MetaMask connection
│   └── useContract.ts    # GenLayer contract calls
└── lib/
    └── genlayer.ts       # Client config + contract address
```

## How It Works

1. Player connects MetaMask wallet
2. Frontend reads clues from contract (view call, free)
3. Player submits guess (write call, signed tx)
4. GenLayer validators process the transaction
5. AI on-chain validates the answer semantically
6. XP awarded, level checked.
