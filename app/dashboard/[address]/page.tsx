// components/Dashboard.tsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreateAITwinForm from "@/components/CreateAITwinForm";
import { useContract } from "@/context/ContractContext";
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { address } = useParams();
  const router = useRouter();
  const { account, mintCloneNFT, isCorrectNetwork, getOwnedClones } = useContract();
  const { switchChain } = useSwitchChain();

  const [showForm, setShowForm] = useState(false);
  const [mintingInProgress, setMintingInProgress] = useState<string | null>(null);
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [nftClones, setNftClones] = useState<Array<{ tokenId: bigint; metadata: string }>>([]);

  useEffect(() => {
    if (!account?.address || account.address.toLowerCase() !== (address as string).toLowerCase()) {
      router.push("/");
    }
  }, [account?.address, address, router]);

  useEffect(() => {
    const loadData = async () => {
      const saved = localStorage.getItem(`aiModels-${address}`);
      setLocalModels(saved ? JSON.parse(saved) : []);
      if (account?.address) setNftClones(await getOwnedClones());
    };
    loadData();
  }, [account?.address, address, getOwnedClones]);

  const handleMint = async (hash: string) => {
    try {
      setMintingInProgress(hash);
      await mintCloneNFT(hash);
      setNftClones(await getOwnedClones());
      setLocalModels(prev => {
        const updated = prev.filter(h => h !== hash);
        localStorage.setItem(`aiModels-${address}`, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setMintingInProgress(null);
    }
  };

  const handleUpload = (hash: string) => {
    setLocalModels(prev => {
      const updated = [...prev, hash];
      localStorage.setItem(`aiModels-${address}`, JSON.stringify(updated));
      return updated;
    });
  };

  if (!isCorrectNetwork) {
    return (
      <div className={styles.alertBox}>
        <h2>Network Mismatch</h2>
        <p>Please switch to Base Sepolia to continue</p>
        <button 
          onClick={() => switchChain({ chainId: baseSepolia.id })} 
          className={styles.primaryButton}
        >
          Switch Network
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      
      <main className={styles.mainContent}>
        <h1 className={styles.title}>AI Twin Dashboard</h1>
        
        <section className={styles.creationSection}>
          {!showForm ? (
            <button 
              onClick={() => setShowForm(true)}
              className={styles.primaryButton}
            >
              + Create New AI Twin
            </button>
          ) : (
            <div className={styles.formWrapper}>
              <CreateAITwinForm 
                address={address as string} 
                onUpload={handleUpload} 
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}
        </section>

        <section className={styles.modelsSection}>
          <h2>Your AI Models</h2>
          <div className={styles.grid}>
            {localModels.map((model, index) => (
              <div key={index} className={styles.card}>
                <h3>Model #{index + 1}</h3>
                <a 
                  href={model} 
                  target="_blank" 
                  rel="noopener" 
                  className={styles.link}
                >
                  View Metadata
                </a>
                <button
                  onClick={() => handleMint(model)}
                  disabled={mintingInProgress === model}
                  className={styles.mintButton}
                >
                  {mintingInProgress === model ? "Minting..." : "Mint as NFT"}
                </button>
              </div>
            ))}
            {localModels.length === 0 && <p>No unminted models found</p>}
          </div>
        </section>

        <section className={styles.nftsSection}>
          <h2>Your NFT Clones</h2>
          <div className={styles.grid}>
            {nftClones.map((clone) => (
              <div key={clone.tokenId.toString()} className={styles.card}>
                <h3>Clone #{clone.tokenId.toString()}</h3>
                <a
                  href={clone.metadata}
                  target="_blank"
                  rel="noopener"
                  className={styles.link}
                >
                  View Metadata
                </a>
              </div>
            ))}
            {nftClones.length === 0 && <p>No NFT clones minted yet</p>}
          </div>
        </section>
      </main>
    </div>
  );
}