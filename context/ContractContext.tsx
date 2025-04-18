"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useConnect, usePublicClient, useSignMessage, useDisconnect } from "wagmi"; // Import `useDisconnect`
import { SiweMessage } from "siwe";
import { cbWalletConnector } from "@/wagmi";
import type { Hex } from "viem";

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void; // Add the disconnect function
  account?: ReturnType<typeof useAccount>;
};

const ContractContext = createContext<ContractContextType | null>(null);

export const ContractProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect(); // Use `useDisconnect` hook
  const account = useAccount();
  const client = usePublicClient();
  const { signMessage } = useSignMessage();
  const [signature, setSignature] = useState<Hex | undefined>(undefined);
  const [message, setMessage] = useState<SiweMessage | undefined>(undefined);
  const [valid, setValid] = useState<boolean | undefined>(undefined);

  // Connect wallet function
  const connectWallet = async () => {
    connect({ connector: cbWalletConnector });

    if (account?.address) {
      const chainId = account.chainId;
      const newMessage = new SiweMessage({
        domain: document.location.host,
        address: account.address,
        chainId,
        uri: document.location.origin,
        version: "1",
        statement: "Smart Wallet SIWE Example",
        nonce: "12345678",
      });

      setMessage(newMessage);
      signMessage({ message: newMessage.prepareMessage() });
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    wagmiDisconnect(); // Call wagmi's disconnect method
    setSignature(undefined); // Clear the signature state
    setMessage(undefined); // Clear the message state
    setValid(undefined); // Reset the valid state
  };

  useEffect(() => {
    if (!signature || !account.address || !client || !message) return;

    client.verifyMessage({
      address: account.address,
      message: message.prepareMessage(),
      signature,
    }).then((isValid) => setValid(isValid));
  }, [signature, account]);

  return (
    <ContractContext.Provider value={{ connectWallet, disconnectWallet, account }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);

  if (!context) {
    throw new Error("useContract must be used within a ContractProvider");
  }

  return context;
};
