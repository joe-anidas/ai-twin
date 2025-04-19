"use client";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { connectWallet, disconnectWallet, account } = useContract();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
    <nav className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
      <h2 className="text-xl font-bold text-gray-100">🤖 AI Twin</h2>
      
      {account?.address ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300 font-mono">
            {account.address.slice(0, 6)}...{account.address.slice(-4)}
          </span>
          <button
            onClick={handleDisconnectWallet}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-gray-100 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/20 relative overflow-hidden"
          >
            <span className="relative z-10">Disconnect</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnectWallet}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-500/20 relative overflow-hidden"
        >
          {loading ? (
            <span className="relative z-10 flex items-center">
              <span className="mr-2">Connecting...</span>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </span>
          ) : (
            <span className="relative z-10">Connect Wallet</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
        </button>
      )}
    </nav>
  );
}