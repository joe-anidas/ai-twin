// components/NetworkAlert.tsx
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";

export default function NetworkAlert() {
  const { switchChain } = useSwitchChain();
  
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900/50 border border-red-700/50 rounded-xl p-8 max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-400">🌌 Network Mismatch</h2>
          <p className="text-gray-400">
            Please switch to Base Sepolia to continue
          </p>
        </div>

        <button 
          onClick={() => switchChain({ chainId: baseSepolia.id })} 
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-gray-100 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-red-500/20 relative overflow-hidden"
        >
          <span className="relative z-10">Switch Network</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20" />
        </button>

        <p className="text-xs text-gray-500 mt-4">
          Ensure you're connected to Base Sepolia testnet
        </p>
      </div>
    </div>
  );
}