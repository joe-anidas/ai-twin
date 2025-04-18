// components/NFTsSection.tsx
import CloneCard from "@/components/dashboard/CloneCard";
import styles from '@/app/dashboard/[address]/Dashboard.module.css';
import { type Address } from 'viem';

interface NFTsSectionProps {
  nftClones: Array<{ tokenId: bigint; metadata: string }>;
  contractAddress?: Address;
}

export default function NFTsSection({ nftClones, contractAddress }: NFTsSectionProps) {
  return (
    <section className={styles.nftsSection}>
      <h2>Your NFT Clones</h2>
      <div className={styles.grid}>
        {nftClones.map((clone) => (
          <CloneCard 
            key={clone.tokenId.toString()} 
            clone={clone}
            contractAddress={contractAddress}
          />
        ))}
        {nftClones.length === 0 && <p>No NFT clones minted yet</p>}
      </div>
    </section>
  );
}