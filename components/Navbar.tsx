"use client";

import { useContract } from "@/context/ContractContext";
import React, { useState } from "react";

export default function Navbar() {
  const { connectWallet, disconnectWallet, account } = useContract();
  const [loading, setLoading] = useState(false); // Track loading state

  const handleConnectWallet = async () => {
    setLoading(true);
    await connectWallet();
    setLoading(false);
  };

  const handleDisconnectWallet = async () => {
    setLoading(true);
    await disconnectWallet();
    setLoading(false);
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between" }}>
      <h2>My DApp</h2>
      <button
        onClick={account?.address ? handleDisconnectWallet : handleConnectWallet} // Toggle between connect and disconnect
        style={{
          padding: "8px 16px",
          cursor: "pointer",
          background: "#007bff",
          color: "#fff",
          borderRadius: "5px",
        }}
      >
        {loading
          ? "Loading..." // Show loading state while connecting or disconnecting
          : account?.address
          ? `Disconnect` // If connected, show Disconnect
          : "Connect Wallet" // If not connected, show Connect Wallet
        }
      </button>
    </nav>
  );
}
