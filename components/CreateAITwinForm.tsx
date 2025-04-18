"use client";

import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/ipfs";

interface Props {
  address: string;
  onUpload: (ipfsUrl: string) => void;
}

export default function CreateAITwinForm({ address, onUpload }: Props) {
  const [text, setText] = useState("");
  const [role, setRole] = useState("Mentor");
  const [visibility, setVisibility] = useState("Public");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    try {
      let fileHash = "";
      if (file) {
        fileHash = await uploadFileToIPFS(file);
      }

      const metadata = {
        address,
        textSample: text,
        role,
        visibility,
        fileUrl: fileHash ? `https://gateway.pinata.cloud/ipfs/${fileHash}` : null,
        timestamp: new Date().toISOString(),
      };

      const jsonHash = await uploadJSONToIPFS(metadata);
      onUpload(`https://gateway.pinata.cloud/ipfs/${jsonHash}`);
    } catch (err: any) {
      console.error("Error uploading AI twin:", err.message);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <textarea
        placeholder="Enter text samples..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />

      <select value={role} onChange={(e) => setRole(e.target.value)} style={{ display: "block", marginTop: "10px" }}>
        <option value="Mentor">Mentor</option>
        <option value="Tutor">Tutor</option>
        <option value="Chatbot">Chatbot</option>
      </select>

      <select value={visibility} onChange={(e) => setVisibility(e.target.value)} style={{ display: "block", marginTop: "10px" }}>
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </select>

      <button onClick={handleSubmit} style={{ display: "block", marginTop: "10px" }}>
        Create AI Twin
      </button>
    </div>
  );
}
