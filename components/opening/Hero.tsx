'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContract } from "@/context/ContractContext";
import Features from "./Features";
import { LoadingScreen } from "../LoadingScreen";

export default function AiTwinHero() {
  const { connectWallet, account } = useContract();
  const [loading, setLoading] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (account?.address) {
      router.push(`/dashboard/${account.address}`);
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
    }
  };

  return (
    <>
      {showLoadingScreen && <LoadingScreen />}
      <section className="relative min-h-screen bg-slate-900 overflow-x-hidden">
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-5 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Hero Section - Reduced top padding */}
        <div className="container mx-auto px-4 sm:px-6 pt-12 md:pt-16 lg:pt-20 pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Content section */}
            <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:pl-12">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4 md:mb-6">
                <span className="text-sm font-medium text-blue-400">
                  Powered by Base & Groq
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                Create Your
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Personal AI Twin
                </span>
              </h1>
              <p className="text-lg text-slate-300 mb-6 md:mb-8 max-w-lg">
                Create custom AI models as mentors, tutors, or chatbots by typing text prompts or uploading files. Choose to keep them private or make them public for everyone to see.
              </p>
              
              {!account?.address && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleConnectWallet}
                    disabled={loading}
                    className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600/90 to-purple-600/90 hover:from-blue-500 hover:to-purple-500 text-gray-100 rounded-xl transition-all duration-300 font-medium group shadow-xl hover:shadow-blue-500/20"
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
                </div>
              )}
            </div>
            
            {/* Image section - optimized positioning */}
            <div className="relative h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] md:-ml-8 lg:-ml-12">
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
    </>
  );
}