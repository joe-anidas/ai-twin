"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { ContractProvider } from "@/context/ContractContext"; // Import ContractProvider
import { config } from "@/wagmi";

export function Providers(props: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config} reconnectOnMount={false}>
      <QueryClientProvider client={queryClient}>
        <ContractProvider> {/* Wrap the children with ContractProvider */}
          {props.children}
        </ContractProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
