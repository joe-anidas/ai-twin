"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreateAITwinForm from "@/components/CreateAITwinForm";
import { useContract } from "@/context/ContractContext";
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";
import styles from './Dashboard.module.css'; // Import the CSS module

export default function Dashboard() {
  const { address } = useParams();
  const router = useRouter();
  const { account, mintCloneNFT, isCorrectNetwork, currentChainId } = useContract();
  const { switchChain } = useSwitchChain();

  const [showForm, setShowForm] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [mintingInProgress, setMintingInProgress] = useState(false);

  // Redirect to home if not connected or address doesn't match
  useEffect(() => {
    if (!account?.address || account.address.toLowerCase() !== (address as string).toLowerCase()) {
      router.push("/");
    }
  }, [account?.address, address, router]);

  const handleMintClone = async () => {
    if (!metadataURI.trim()) {
      alert("Please enter a valid metadata URI");
      return;
    }

    if (!isCorrectNetwork) {
      alert("You're on the wrong network. Please switch to Base Sepolia before minting.");
      return;
    }

    try {
      setMintingInProgress(true);
      const txHash = await mintCloneNFT(metadataURI);
      alert(`✅ NFT Minted Successfully!\nTransaction Hash: ${txHash}`);
      setMetadataURI("");
    } catch (error) {
      console.error("Minting error:", error);
      alert(`❌ Minting failed: ${(error instanceof Error && error.message) || "Unknown error occurred. Please try again."}`);
    } finally {
      setMintingInProgress(false);
    }
  };

  if (!isCorrectNetwork) {
    return (
      <div className={styles.alertBox}>
        <h2>Network Mismatch</h2>
        <p>Required: Base Sepolia (ID: {baseSepolia.id})<br />Current: {currentChainId ? `ID: ${currentChainId}` : "Not connected"}</p>
        <button onClick={() => switchChain({ chainId: baseSepolia.id })} className={styles.button}>
          Switch to Base Sepolia
        </button>
        <p className={styles.infoText}>Make sure your wallet supports Base Sepolia network</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Navbar />
      <h1 className={styles.dashboardHeader}>Dashboard for Address: {address}</h1>

      {/* Show AI Twin Creation Form or Minting */}
      {!showForm ? (
        <div>
          <button
            onClick={() => setShowForm(true)}
            className={styles.button}
          >
            Create AI Twin
          </button>
        </div>
      ) : (
        <div>
          <CreateAITwinForm address={address as string} onUpload={setIpfsHash} />
          <div className={styles.formContainer}>
            <label className={styles.formLabel}>
              Metadata URI (IPFS or HTTPS):
            </label>
            <input
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              className={styles.formInput}
              placeholder="ipfs://Qm... or https://..."
            />
            <p className={styles.infoText}>
              Example IPFS URI: ipfs://QmX9z6f8... or HTTPS URL
            </p>
          </div>
          <button
            onClick={handleMintClone}
            disabled={mintingInProgress}
            className={styles.button}
          >
            {mintingInProgress ? "⏳ Minting in Progress..." : "🖼️ Mint AI Twin NFT"}
          </button>
        </div>
      )}

      {/* Show IPFS Hash after uploading metadata */}
      {ipfsHash && (
        <p className={styles.metadataLink}>
          View AI Twin Metadata:{" "}
          <a href={ipfsHash} target="_blank" rel="noopener noreferrer">
            {ipfsHash}
          </a>
        </p>
      )}

      {/* Display connected wallet */}
      {account?.address && (
        <div className={styles.walletInfo}>
          <p className="text-sm text-gray-600">
            Connected Wallet:{" "}
            <span className="font-mono break-words">{account.address}</span>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Current Network: Base Sepolia (ID: {baseSepolia.id})
          </p>
        </div>
      )}
    </div>
  );
}
