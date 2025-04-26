"use client";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import { useState, useEffect } from "react";
import { SparklesIcon, GlobeAltIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { LoadingScreen } from "../LoadingScreen";

export default function Navbar() {
  const { connectWallet, disconnectWallet, account } = useContract();
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (account?.address) {
      router.push(`/dashboard/${account.address}`);
      setIsMenuOpen(false);
      // Delay hiding loading screen to ensure smooth transition
      setTimeout(() => setShowLoadingScreen(false), 500);
    }
  }, [account?.address, router]);

  const handleConnectWallet = async () => {
    setLoading(true);
    setShowLoadingScreen(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection error:", error);
      setShowLoadingScreen(false);
    } finally {
      setLoading(false);
      setIsMenuOpen(false);
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
    setIsMenuOpen(false);
  };

  const handlePublicModelsClick = () => {
    const element = document.getElementById("public-models");
    if (element) {
      const yOffset = -60;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const MobileMenu = () => (
    <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-t border-gray-700/50">
      <div className="px-4 py-4 space-y-4">
        {account?.address ? (
          <>
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-3 rounded-lg">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-300 font-mono">
                {account.address.slice(0, 4)}...{account.address.slice(-4)}
              </span>
            </div>
            
            <button
              onClick={() => {
                router.push(`/dashboard/public/${account.address}`);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-indigo-600/80 text-gray-100 rounded-lg"
            >
              <GlobeAltIcon className="w-5 h-5" />
              <span>Public Models</span>
            </button>
            
            <button
              onClick={handleDisconnectWallet}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-gray-800 text-gray-300 rounded-lg"
            >
              <span>Disconnect</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handlePublicModelsClick}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-indigo-600/80 text-gray-100 rounded-lg"
            >
              <GlobeAltIcon className="w-5 h-5" />
              <span>Public Models</span>
            </button>
            
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-gray-100 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span>Connect Wallet</span>
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {showLoadingScreen && <LoadingScreen />}
      <nav className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-md group-hover:bg-indigo-500/20 transition-all" />
                <SparklesIcon className="w-7 h-7 text-indigo-400 transform group-hover:scale-110 transition-all" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Twin AI
              </h2>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {account?.address ? (
                <>
                  <div className="flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-700/50">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/dashboard/public/${account.address}`)}
                    className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-indigo-600/80 to-purple-500/80 hover:from-indigo-500/80 hover:to-purple-400/80 text-gray-100 rounded-lg transition-all duration-300 font-medium border border-indigo-500/50 hover:border-indigo-400/50 group flex items-center space-x-2"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-white/80" />
                    <span>Public Models</span>
                  </button>
                  
                  <button
                    onClick={handleDisconnectWallet}
                    className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-300 rounded-lg transition-all duration-300 font-medium border border-gray-700/50 hover:border-gray-600/50 group"
                  >
                    <span>Disconnect</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePublicModelsClick}
                    className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-indigo-600/80 to-purple-500/80 hover:from-indigo-500/80 hover:to-purple-400/80 text-gray-100 rounded-lg transition-all duration-300 font-medium border border-indigo-500/50 hover:border-indigo-400/50 group flex items-center space-x-2"
                  >
                    <GlobeAltIcon className="w-5 h-5 text-white/80" />
                    <span>Public Models</span>
                  </button>
                  
                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-xl transition-all duration-300 font-medium group shadow-xl hover:shadow-indigo-500/20"
                  >
                    <div className="flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white/80"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      <span>Connect Wallet</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {isMenuOpen && <MobileMenu />}
        </div>
      </nav>
    </>
  );
}