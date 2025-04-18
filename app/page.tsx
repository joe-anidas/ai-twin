"use client";

import Navbar from "../components/Navbar"; // Adjust the import path as necessary
import { useContract } from "@/context/ContractContext";

export default function Home() {
  const { account } = useContract();
  return (
    <main style={{ padding: "20px" }}>
      <Navbar /> {/* Use the Navbar component that already has connectWallet functionality */}
      <h1>Smart Wallet Integration</h1>
      {/* Other content of your Home component */}
    </main>
  );
}
