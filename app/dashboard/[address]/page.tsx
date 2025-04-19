// components/Dashboard.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import NetworkAlert from "@/components/dashboard/NetworkAlert";
import CreationSection from "@/components/dashboard/CreationSection";
import ModelsSection from "@/components/dashboard/ModelsSection";
import NFTsSection from "@/components/dashboard/NFTsSection";
import { useContract, type CloneData } from "@/context/ContractContext";
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { address } = useParams();
  const router = useRouter();
  const { 
    account, 
    mintCloneNFT, 
    isCorrectNetwork, 
    getOwnedClones,
    contractAddress
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

  if (!isCorrectNetwork) return <NetworkAlert />;

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      <main className={styles.mainContent}>
        <h1 className={styles.title}>AI Twin Dashboard</h1>
        
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
      </main>
    </div>
  );
}