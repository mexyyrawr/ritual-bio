export const RITUAL_BIO_ADDRESS =
  (process.env.NEXT_PUBLIC_BIO_CONTRACT as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const RITUAL_BIO_ABI = [
  {
    name: "setProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "links", type: "string[]" },
    ],
    outputs: [],
  },
  {
    name: "getProfile",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "links", type: "string[]" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "hasProfile",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "deleteProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "ProfileUpdated",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "linkCount", type: "uint256", indexed: false },
    ],
  },
] as const;
