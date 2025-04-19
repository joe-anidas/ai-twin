// context/ContractContext.tsx
"use client";
import { cbWalletConnector } from "@/wagmi";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAccount, useConnect, useDisconnect, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { baseSepolia } from "viem/chains";
import CloneNFTAbi from "@/artifacts/contracts/CloneNFT.sol/CloneNFT.json";
import { Abi, Address, Hex } from "viem";

export type CloneData = {
  tokenId: bigint;
  metadata: string;
  createdAt: number;
};

type ContractContextType = {
  connectWallet: () => void;
  disconnectWallet: () => void;
  account?: ReturnType<typeof useAccount>;
  mintCloneNFT: (metadataURI: string) => Promise<Hex>;
  getOwnedClones: () => Promise<CloneData[]>;
  isCorrectNetwork: boolean;
  currentChainId?: number;
  contractAddress: Address;
};

const ContractContext = createContext<ContractContextType | null>(null);
const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x68B76bdD2d3E285dc76f5FDBD3cf63072561A3A6") as Address;
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/109144/hackhazards/v0.0.3";

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const { connect } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const account = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentChainId, setCurrentChainId] = useState<number>();

  const connectWallet = async () => {
    try {
      connect({ connector: cbWalletConnector });
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    wagmiDisconnect();
  };

  const verifyNetwork = async () => {
    const correct = account.chainId === baseSepolia.id;
    setIsCorrectNetwork(correct);
    setCurrentChainId(account.chainId);
    return correct;
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChainAsync({ chainId: baseSepolia.id });
      return true;
    } catch (error) {
      console.error("Network switch failed:", error);
      return false;
    }
  };
  // context/ContractContext.tsx (updated)
// Add these new utility functions at the bottom of the ContractProvider component
const waitForSubgraphSync = async (targetBlock: number): Promise<void> => {
  const MAX_ATTEMPTS = 30; // ~90 seconds total
  const POLL_INTERVAL = 3000; // 3 seconds
  
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{ _meta { block { number } } }`
        })
      });

      const { data } = await response.json();
      const currentBlock = data?._meta?.block?.number;
      
      if (currentBlock && currentBlock >= targetBlock) {
        return;
      }
    } catch (error) {
      console.error('Subgraph poll error:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
  
  throw new Error('Subgraph sync timeout');
};

const getTransactionBlock = async (txHash: Hex): Promise<number> => {
  if (!publicClient) throw new Error("No public client");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  return Number(receipt.blockNumber);
};
  const getOwnedClones = async (): Promise<CloneData[]> => {
    if (!account?.address) return [];

    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query GetClones($owner: Bytes!) {
              publicModels(where: { owner: $owner }) {
                id
                metadataURI
                blockTimestamp
              }
            }
          `,
          variables: {
            owner: account.address.toLowerCase()
          }
        })
      });

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      return data.publicModels.map((nft: any) => ({
        tokenId: BigInt(nft.id),
        metadata: nft.metadataURI,
        createdAt: Number(nft.blockTimestamp)
      }));
    } catch (error) {
      console.error("Subgraph query error:", error);
      return [];
    }
  };

  const mintCloneNFT = async (metadataURI: string): Promise<Hex> => {
    if (!account.address) throw new Error("Wallet not connected");
    if (!(await verifyNetwork()) && !(await handleSwitchNetwork())) {
      throw new Error("Network switch required");
    }
  
    if (!walletClient || !publicClient) {
      throw new Error("Wallet connection error");
    }
  
    const { request } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESS,
      abi: CloneNFTAbi.abi as Abi,
      functionName: "mintClone",
      args: [account.address, metadataURI],
      account: account.address,
    });
  
    const txHash = await walletClient.writeContract(request);
    const blockNumber = await getTransactionBlock(txHash);
    await waitForSubgraphSync(blockNumber);
    
    return txHash;
  };

  useEffect(() => { verifyNetwork(); }, [account.chainId]);

  return (
    <ContractContext.Provider value={{
      connectWallet,
      disconnectWallet,
      account,
      mintCloneNFT,
      getOwnedClones,
      isCorrectNetwork,
      currentChainId,
      contractAddress: CONTRACT_ADDRESS,
    }}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) throw new Error("useContract must be used within a ContractProvider");
  return context;
};