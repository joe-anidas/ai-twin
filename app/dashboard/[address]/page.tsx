"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreateAITwinForm from "@/components/CreateAITwinForm";
import { useContract } from "@/context/ContractContext";
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";

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
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Network Mismatch</h2>
        <p className="mb-4 text-gray-700">
          Required: Base Sepolia (ID: {baseSepolia.id})<br />
          Current: {currentChainId ? `ID: ${currentChainId}` : "Not connected"}
        </p>
        <button
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Switch to Base Sepolia
        </button>
        <p className="mt-4 text-sm text-gray-500">Make sure your wallet supports Base Sepolia network</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard for Address: {address}</h1>

      {/* Show AI Twin Creation Form or Minting */}
      {!showForm ? (
        <div>
          <button
            onClick={() => setShowForm(true)}
            style={{ marginTop: "20px" }}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create AI Twin
          </button>
        </div>
      ) : (
        <div>
          <CreateAITwinForm address={address as string} onUpload={setIpfsHash} />
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metadata URI (IPFS or HTTPS):
            </label>
            <input
              type="text"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ipfs://Qm... or https://..."
            />
            <p className="mt-2 text-sm text-gray-500">
              Example IPFS URI: ipfs://QmX9z6f8... or HTTPS URL
            </p>
          </div>
          <button
            onClick={handleMintClone}
            disabled={mintingInProgress}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
          >
            {mintingInProgress ? "⏳ Minting in Progress..." : "🖼️ Mint AI Twin NFT"}
          </button>
        </div>
      )}

      {/* Show IPFS Hash after uploading metadata */}
      {ipfsHash && (
        <p style={{ marginTop: "20px" }}>
          View AI Twin Metadata:{" "}
          <a href={ipfsHash} target="_blank" rel="noopener noreferrer">
            {ipfsHash}
          </a>
        </p>
      )}

      {/* Display connected wallet */}
      {account?.address && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
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
