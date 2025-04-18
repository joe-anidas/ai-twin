// components/NetworkAlert.tsx
import { baseSepolia } from "viem/chains";
import { useSwitchChain } from "wagmi";
import styles from '@/app/dashboard/[address]/Dashboard.module.css';

export default function NetworkAlert() {
  const { switchChain } = useSwitchChain();
  
  return (
    <div className={styles.alertBox}>
      <h2>Network Mismatch</h2>
      <p>Please switch to Base Sepolia to continue</p>
      <button 
        onClick={() => switchChain({ chainId: baseSepolia.id })} 
        className={styles.primaryButton}
      >
        Switch Network
      </button>
    </div>
  );
}