// components/CloneCard.tsx
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

export default function CloneCard({ clone }: { clone: { tokenId: bigint; metadata: string } }) {
  return (
    <div className={styles.card}>
      <h3>Clone #{clone.tokenId.toString()}</h3>
      <a
        href={clone.metadata}
        target="_blank"
        rel="noopener"
        className={styles.link}
      >
        View Metadata
      </a>
    </div>
  );
}