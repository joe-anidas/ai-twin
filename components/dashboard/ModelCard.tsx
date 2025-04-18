// components/ModelCard.tsx
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

export default function ModelCard({
  model,
  index,
  isMinting,
  onMint
}: {
  model: string;
  index: number;
  isMinting: boolean;
  onMint: (hash: string) => void;
}) {
  return (
    <div className={styles.card}>
      <h3>Model #{index + 1}</h3>
      <a 
        href={model} 
        target="_blank" 
        rel="noopener" 
        className={styles.link}
      >
        View Metadata
      </a>
      <button
        onClick={() => onMint(model)}
        disabled={isMinting}
        className={styles.mintButton}
      >
        {isMinting ? "Minting..." : "Mint as NFT"}
      </button>
    </div>
  );
}   