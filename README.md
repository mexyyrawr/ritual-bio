# 🔗 Ritual Bio

On-chain profile / Linktree untuk Ritual Chain.

## Features

- ✅ Set name, bio, dan links on-chain
- ✅ Public profile page (shareable link)
- ✅ Max 20 links per profile
- ✅ Simple & clean UI

## Tech Stack

- **Contract:** Solidity 0.8.20
- **Frontend:** Next.js 14 + Tailwind CSS
- **Chain:** Ritual Testnet (Chain ID 1979)

## Setup

### 1. Deploy Contract

```bash
cd foundry
./deploy.sh <your_private_key>
```

Setelah deploy, copy contract address ke `.env.local`:

```
NEXT_PUBLIC_BIO_CONTRACT=0x...
```

### 2. Run Frontend

```bash
npm install
npm run dev
```

Buka http://localhost:3000

### 3. Deploy to Vercel

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/mexyyrawr/ritual-bio.git
git push -u origin main
```

Connect ke Vercel, set environment variable:
- `NEXT_PUBLIC_BIO_CONTRACT` = contract address

## Contract

```solidity
// Set profile
function setProfile(string name, string bio, string[] links) external;

// Get profile
function getProfile(address user) external view returns (string name, string bio, string[] links, uint256 updatedAt);

// Check if has profile
function hasProfile(address user) external view returns (bool);

// Delete profile
function deleteProfile() external;
```

## Public Profile URL

```
https://ritual-bio.vercel.app/0x94AC...866c
```

## License

MIT
