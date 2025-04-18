"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CreateAITwinForm from "@/components/CreateAITwinForm";
import { useContract } from "@/context/ContractContext";

export default function Dashboard() {
  const { address } = useParams();
  const router = useRouter();
  const { account } = useContract(); // Use wallet connection from context
  const [showForm, setShowForm] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");

  useEffect(() => {
    // Redirect to home if not connected or address doesn't match
    if (!account?.address || account.address.toLowerCase() !== (address as string).toLowerCase()) {
      router.push("/");
    }
  }, [account?.address, address, router]);

  return (
    <div>
      <Navbar />
      <h1>Dashboard for Address: {address}</h1>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ marginTop: "20px" }}>
          Create AI Twin
        </button>
      ) : (
        <CreateAITwinForm address={address as string} onUpload={setIpfsHash} />
      )}

      {ipfsHash && (
        <p style={{ marginTop: "20px" }}>
          View AI Twin Metadata:{" "}
          <a href={ipfsHash} target="_blank" rel="noopener noreferrer">
            {ipfsHash}
          </a>
        </p>
      )}
    </div>
  );
}
