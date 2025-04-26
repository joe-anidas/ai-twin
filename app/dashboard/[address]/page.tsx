// components/Dashboard.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import NetworkAlert from "@/components/dashboard/NetworkAlert";
import CreationSection from "@/components/dashboard/CreationSection";
import ModelsSection from "@/components/dashboard/ModelsSection";
import NFTsSection from "@/components/dashboard/NFTsSection";
import { useContract} from "@/context/ContractContext";
import { CloneData } from "@/lib/queries";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function Dashboard() {
  const { address } = useParams();
  const router = useRouter();
  const { 
    account, 
    mintCloneNFT, 
    isCorrectNetwork, 
    getOwnedClones,
    contractAddress,isDisconnecting
  } = useContract();
  
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [nftClones, setNftClones] = useState<CloneData[]>([]);
  const [mintingInProgress, setMintingInProgress] = useState<string | null>(null);

  useEffect(() => {
    if (!account?.address || account.address.toLowerCase() !== (address as string).toLowerCase()) {
      router.push("/");
    }
  }, [account?.address, address, router]);

  useEffect(() => {
    const loadClones = async () => {
      if (account?.address) {
        const clones = await getOwnedClones();
        setNftClones(clones);
      }
    };
    
    loadClones();
  }, [account?.address, getOwnedClones]);

  const handleMint = async (hash: string) => {
    try {
      setMintingInProgress(hash);
      await mintCloneNFT(hash);
      
      // Force refresh using state reset
      setNftClones([]);
      const newClones = await getOwnedClones();
      setNftClones(newClones);
      
      setLocalModels(prev => prev.filter(h => h !== hash));
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setMintingInProgress(null);
    }
  };

  const handleUpload = (hash: string) => {
    setLocalModels(prev => [...prev, hash]);
  };

  if (!isCorrectNetwork && !isDisconnecting) return <NetworkAlert />;

  return (
    <div className="min-h-full bg-gray-900">
      <Navbar />
      {isDisconnecting && <LoadingScreen />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-8">
          🪐 Twin AI Dashboard
        </h1>

        <div className="space-y-12">
          <CreationSection 
            address={address as string}
            onUpload={handleUpload}
          />
          
          <ModelsSection 
            localModels={localModels}
            mintingInProgress={mintingInProgress}
            onMint={handleMint}
          />
          
          <NFTsSection 
            nftClones={nftClones}
            contractAddress={contractAddress}
            isLoading={mintingInProgress !== null}
          />
        </div>
      </main>
    </div>
  );
}