#!/bin/bash
# Deploy RitualBio contract to Ritual Testnet
# Usage: ./deploy.sh <private_key>

set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <private_key>"
  echo "Example: ./deploy.sh 0xabc123..."
  exit 1
fi

PRIVATE_KEY=$1
RPC_URL="https://rpc.ritualfoundation.org"

echo "🔨 Compiling contract..."
forge build

echo ""
echo "🚀 Deploying RitualBio to Ritual Testnet..."
forge create src/RitualBio.sol:RitualBio \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

echo ""
echo "✅ Done! Update NEXT_PUBLIC_BIO_CONTRACT in .env.local with the deployed address."
