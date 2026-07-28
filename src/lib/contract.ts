export const RITUAL_BIO_ADDRESS =
  (process.env.NEXT_PUBLIC_BIO_CONTRACT as `0x${string}`) ??
  "0x559E02Dc4Ab19F007C6F8c3278aAc5ABcF00B239";

export const RITUAL_BIO_ABI = [
  {
    name: "setProfile",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "username", type: "string" },
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarUrl", type: "string" },
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
      { name: "username", type: "string" },
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarUrl", type: "string" },
      { name: "links", type: "string[]" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "getProfileByUsername",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "bio", type: "string" },
      { name: "avatarUrl", type: "string" },
      { name: "links", type: "string[]" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "resolveUsername",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [{ name: "user", type: "address" }],
  },
  {
    name: "isUsernameAvailable",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "username", type: "string" }],
    outputs: [{ name: "", type: "bool" }],
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
      { name: "username", type: "string", indexed: false },
      { name: "name", type: "string", indexed: false },
      { name: "linkCount", type: "uint256", indexed: false },
    ],
  },
] as const;
