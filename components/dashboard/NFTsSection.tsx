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
    <section className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-100">Your NFT Clones</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-6 bg-white/5 rounded-lg animate-pulse">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            <span className="text-gray-300">Updating clones...</span>
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
              <p className="col-span-full text-center text-gray-400 py-8">
                No NFT clones minted yet
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}