'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import Features from "./Features";

export default function AiTwinHero() {
  const { connectWallet, disconnectWallet, account } = useContract();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('create');

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
    <section className="relative min-h-screen bg-slate-900">
      {/* Grid pattern background */}
      <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-6">
              <span className="text-sm font-medium text-blue-400">
                Powered by Base, Groq & Fluvio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Create Your
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Personal AI Twin
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-lg">
              Create custom AI models as mentors, tutors, or chatbots by typing text prompts or uploading files. Choose to keep them private or make them public for everyone to see.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {account?.address ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-300 font-mono">
                      {account.address.slice(0, 6)}...{account.address.slice(-4)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/create/${account.address}`)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-blue-500/20"
                  >
                    Create Model
                  </button>
                  
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all duration-300 border border-slate-700/50 hover:border-slate-600/50"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-medium shadow-xl hover:shadow-blue-500/20"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <span>Connecting</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
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
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Image section */}
          <div className="relative h-full min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl" />
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/images/cover4.jpg"
                alt="AI Model Creation"
                fill
                className="object-cover"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
              />
            </div>
          </div>
        </div>
      </div>
      <Features />
    </section>
  );
}