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
  const { account, mintCloneNFT, isCorrectNetwork, currentChainId } = useContract();
  const { switchChain } = useSwitchChain();

  const [showForm, setShowForm] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [mintingInProgress, setMintingInProgress] = useState(false);

  useEffect(() => {
    if (!account?.address || account.address.toLowerCase() !== (address as string).toLowerCase()) {
      router.push("/");
    }
  }, [account?.address, address, router]);

  const handleMintClone = async () => {
    if (!ipfsHash.trim()) {
      alert("Please create an AI Twin before minting");
      return;
    }

    if (!isCorrectNetwork) {
      alert("Please switch to Base Sepolia before minting.");
      return;
    }

    try {
      setMintingInProgress(true);
      const txHash = await mintCloneNFT(ipfsHash);
      alert(`✅ NFT Minted Successfully!\nTransaction Hash: ${txHash}`);
      setIpfsHash("");
    } catch (error) {
      console.error("Minting error:", error);
      alert(`❌ Minting failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setMintingInProgress(false);
    }
  };

  if (!isCorrectNetwork) {
    return (
      <div className={styles.alertBox}>
        <h2>Network Mismatch</h2>
        <p>Required: Base Sepolia (ID: {baseSepolia.id})<br />Current: {currentChainId || "Not connected"}</p>
        <button onClick={() => switchChain({ chainId: baseSepolia.id })} className={styles.button}>
          Switch to Base Sepolia
        </button>
        <p className={styles.infoText}>Ensure your wallet supports Base Sepolia</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      <h1 className={styles.dashboardHeader}>Dashboard for {address}</h1>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className={styles.button}>
          Create AI Twin
        </button>
      ) : (
        <div>
          <CreateAITwinForm address={address as string} onUpload={setIpfsHash} />
          {ipfsHash && (
            <p className={styles.metadataLink}>
              AI Twin Metadata: {" "}
              <a href={ipfsHash} target="_blank" rel="noopener noreferrer">
                {ipfsHash}
              </a>
            </p>
          )}
          <button
            onClick={handleMintClone}
            disabled={mintingInProgress || !ipfsHash}
            className={styles.button}
          >
            {mintingInProgress ? "⏳ Minting..." : "🖼️ Mint AI Twin NFT"}
          </button>
        </div>
      )}

      {account?.address && (
        <div className={styles.walletInfo}>
          <p>Connected Wallet: <span>{account.address}</span></p>
          <p>Network: Base Sepolia (ID: {baseSepolia.id})</p>
        </div>
      )}
    </div>
  );
}