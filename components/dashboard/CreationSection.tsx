// components/CreationSection.tsx
"use client";

import { useState } from "react";
import CreateAITwinForm from "@/components/dashboard/CreateAITwinForm";
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

export default function CreationSection({ address, onUpload }: { 
  address: string;
  onUpload: (hash: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className={styles.creationSection}>
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className={styles.primaryButton}
        >
          + Create New AI Twin
        </button>
      ) : (
        <div className={styles.formWrapper}>
          <CreateAITwinForm 
            address={address} 
            onUpload={onUpload} 
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </section>
  );
}