import { useState, useEffect } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/ipfs";
import { getExistingModelNames } from "@/lib/queries";
import { debounce } from "@/utils/helpers";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
  const [existingNames, setExistingNames] = useState<Set<string>>(new Set());
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const loadExistingNames = async () => {
      try {
        const names = await getExistingModelNames();
        setExistingNames(new Set(names));
      } catch (err) {
        console.error("Failed to load existing names:", err);
      }
    };
    loadExistingNames();
  }, []);

  const checkNameAvailability = debounce(async (name: string) => {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      const names = await getExistingModelNames();
      setExistingNames(new Set(names));
      const available = !names.includes(trimmedName);
      setNameAvailable(available);
      setError(available ? null : "Model name already exists");
    } catch (err) {
      console.error("Name check failed:", err);
      setNameAvailable(null);
    } finally {
      setCheckingName(false);
    }
  }, 500);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setModelName(newName);
    setError(null);
    setNameAvailable(null);
    
    if (newName.trim()) {
      await checkNameAvailability(newName);
    }
  };

  const handleSubmit = async () => {
    const trimmedName = modelName.trim();
    
    if (!trimmedName) {
      setError("Model name is required.");
      return;
    }
    
    if (!text.trim()) {
      setError("Text sample is required.");
      return;
    }

    if (existingNames.has(trimmedName.toLowerCase())) {
      setError("Model name already exists. Please choose a different name.");
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
        modelName: trimmedName,
        textSample: text.trim(),
        role,
        visibility,
        fileUrl: fileHash ? `https://gateway.pinata.cloud/ipfs/${fileHash}` : null,
        timestamp: new Date().toISOString(),
      };

      const jsonHash = await uploadJSONToIPFS(metadata);
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${jsonHash}`;
      
      setExistingNames(prev => new Set([...prev, trimmedName.toLowerCase()]));
      
      setModelName("");
      setText("");
      setRole("Mentor");
      setVisibility("Public");
      setFile(null);
      setNameAvailable(null);

      onUpload(ipfsUrl);
    } catch (err: any) {
      console.error("Error creating AI twin:", err);
      setError(err.message || "Failed to create AI twin. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 transition-all duration-300 ring-1 ring-gray-700/50 hover:ring-indigo-500/20">
      <h2 className="text-3xl font-bold mb-8 text-gray-100">
        🌌 Create AI Twin
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-pink-900/30 border border-pink-700/50 rounded-lg text-pink-400">
          ⚠️ {error}
        </div>
      )}

      <div className="mb-6 relative">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Model Name
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Unique model name..."
            value={modelName}
            onChange={handleNameChange}
            className={`w-full px-4 py-3 bg-gray-800/50 border ${
              nameAvailable === true
                ? "border-green-500/50 focus:border-green-500"
                : nameAvailable === false
                ? "border-red-500/50 focus:border-red-500"
                : "border-gray-700/50 focus:border-indigo-500"
            } rounded-lg focus:ring-2 focus:ring-indigo-500/20 text-gray-100 placeholder-gray-500 transition-all duration-300`}
            disabled={loading}
          />
          <div className="absolute right-3 top-3">
            {checkingName && (
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            )}
            {!checkingName && nameAvailable === true && (
              <CheckIcon className="w-5 h-5 text-green-400" />
            )}
            {!checkingName && nameAvailable === false && (
              <XMarkIcon className="w-5 h-5 text-red-400" />
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Training Text Samples
        </label>
        <textarea
          placeholder="Paste text samples for training..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-gray-100 placeholder-gray-500 resize-none transition-all duration-300"
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Upload Training Data (Optional)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-700/50 border-dashed rounded-lg cursor-pointer bg-gray-800/50 hover:border-indigo-500/50 transition-all duration-300">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg 
                className="w-8 h-8 mb-2 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="text-sm text-gray-400">
                {file ? file.name : "Click to upload"}
              </p>
            </div>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Role Type
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-gray-100 transition-all duration-300"
            disabled={loading}
          >
            <option 
              value="Friendly Assistant"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Friendly Assistant
            </option>
            <option 
              value="Fitness Coach"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Fitness Coach
            </option>
            <option 
              value="Chatbot"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Chatbot
            </option>
            <option 
              value="Mentor"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Mentor
            </option>
            <option 
              value="Tutor"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Tutor
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Visibility
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-gray-100 transition-all duration-300"
            disabled={loading}
          >
            <option 
              value="Public"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Public
            </option>
            <option 
              value="Private"
              className="bg-gray-900 text-gray-100"
              style={{ backgroundColor: '#111827', color: '#f3f4f6' }}
            >
              Private
            </option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-300 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || nameAvailable === false}
        >
          {loading ? (
            <>
              <span className="mr-2">Uploading...</span>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </>
          ) : (
            "Launch AI Twin"
          )}
        </button>
      </div>

      <p className="text-center text-xs text-indigo-400/80 mt-6 font-space">
        ⚡ Powered by Base L2 Protocol
      </p>
    </div>
  );
}