import { http, createConfig } from "wagmi";
import { ritualChain } from "./chain";

export const config = createConfig({
  chains: [ritualChain],
  transports: {
    [ritualChain.id]: http(),
  },
});
