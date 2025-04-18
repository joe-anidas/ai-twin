// components/ModelsSection.tsx
import ModelCard from "@/components/dashboard/ModelCard";
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

export default function ModelsSection({ 
  localModels, 
  mintingInProgress, 
  onMint 
}: {
  localModels: string[];
  mintingInProgress: string | null;
  onMint: (hash: string) => void;
}) {
  return (
    <section className={styles.modelsSection}>
      <h2>Your AI Models</h2>
      <div className={styles.grid}>
        {localModels.map((model, index) => (
          <ModelCard
            key={index}
            model={model}
            index={index}
            isMinting={mintingInProgress === model}
            onMint={onMint}
          />
        ))}
        {localModels.length === 0 && <p>No unminted models found</p>}
      </div>
    </section>
  );
}