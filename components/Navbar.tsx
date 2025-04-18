"use client";

import { useRouter } from "next/navigation"; // Use client-side navigation
import { useContract } from "@/context/ContractContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { connectWallet, disconnectWallet, account } = useContract();
  const [loading, setLoading] = useState(false); // Track loading state
  const router = useRouter(); // Initialize useRouter here

  useEffect(() => {
    // If account is available, navigate to the dashboard
    if (account?.address) {
      router.push(`/dashboard/${account.address}`);
    }
  }, [account?.address, router]);

  const handleConnectWallet = async () => {
    setLoading(true);
    await connectWallet();
    setLoading(false);
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
      <h2>My DApp</h2>
      
      {/* Render either the Connect button or the wallet info based on whether the user is logged in */}
      {account?.address ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "10px" }}>
            Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)} {/* Display a shortened address */}
          </span>
          <button
            onClick={handleDisconnectWallet}
            style={{
              padding: "8px 16px",
              cursor: "pointer",
              background: "#ff4d4d", // Disconnect button in red
              color: "#fff",
              borderRadius: "5px",
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnectWallet}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            background: "#007bff",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          {loading ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </nav>
  );
}
