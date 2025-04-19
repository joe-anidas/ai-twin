// components/NFTsSection.tsx
import CloneCard from "@/components/dashboard/CloneCard";
import { type Address } from 'viem';

interface NFTsSectionProps {
  nftClones: Array<{ tokenId: bigint; metadata: string }>;
  contractAddress?: Address;
  isLoading: boolean;
}

export default function NFTsSection({ nftClones, contractAddress, isLoading }: NFTsSectionProps) {
  const sortedClones = [...nftClones].sort((a, b) => Number(b.tokenId) - Number(a.tokenId));

  return (
    <section className="w-full space-y-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🌀 Your AI Clones
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center h-64 space-y-6">
            <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300 text-lg">Syncing neural clones...</p>
          </div>
        ) : (
          <>
            {sortedClones.map((clone) => (
              <CloneCard
                key={clone.tokenId.toString()}
                clone={clone}
                contractAddress={contractAddress}
              />
            ))}
            {nftClones.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-12 space-y-4 bg-gray-900/30 rounded-xl">
                <p className="text-xl text-gray-300">
                  🌌 No NFT clones discovered yet
                </p>
                <p className="text-sm text-gray-400">
                  Mint your first clone to begin the cosmic journey
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}