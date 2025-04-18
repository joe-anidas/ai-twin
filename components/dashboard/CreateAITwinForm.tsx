import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/ipfs";

interface Props {
  address: string;
  onUpload: (ipfsUrl: string) => void;
  onCancel: () => void;
}

export default function CreateAITwinForm({ address, onUpload, onCancel }: Props) {
  const [modelName, setModelName] = useState("");
  const [text, setText] = useState("");
  const [role, setRole] = useState("Mentor");
  const [visibility, setVisibility] = useState("Public");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!modelName.trim()) {
      setError("Model name is required.");
      return;
    }

    if (!text.trim()) {
      setError("Text sample is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let fileHash = "";
      if (file) {
        fileHash = await uploadFileToIPFS(file);
      }

      const metadata = {
        address,
        modelName,
        textSample: text,
        role,
        visibility,
        fileUrl: fileHash ? `https://gateway.pinata.cloud/ipfs/${fileHash}` : null,
        timestamp: new Date().toISOString(),
      };

      const jsonHash = await uploadJSONToIPFS(metadata);
      onUpload(`https://gateway.pinata.cloud/ipfs/${jsonHash}`);

      // Reset form fields
      setModelName("");
      setText("");
      setRole("Mentor");
      setVisibility("Public");
      setFile(null);
    } catch (err: any) {
      console.error("Error uploading AI twin:", err.message);
      setError("Failed to upload the AI twin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="text"
        placeholder="Enter model name..."
        value={modelName}
        onChange={(e) => setModelName(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Enter text samples..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ marginBottom: "10px" }}
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ display: "block", marginTop: "10px" }}
      >
        <option value="Mentor">Mentor</option>
        <option value="Tutor">Tutor</option>
        <option value="Chatbot">Chatbot</option>
      </select>

      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
        style={{ display: "block", marginTop: "10px" }}
      >
        <option value="Public">Public</option>
        <option value="Private">Private</option>
      </select>

      <button
        onClick={handleSubmit}
        style={{ display: "block", marginTop: "10px" }}
        disabled={loading}
      >
        {loading ? "Creating AI Twin..." : "Create AI Twin"}
      </button>

      <button
        onClick={onCancel}
        style={{ display: "block", marginTop: "10px", backgroundColor: "gray" }}
      >
        Cancel
      </button>
    </div>
  );
}
