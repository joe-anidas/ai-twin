// components/CreationSection.tsx
"use client";
import { useState } from "react";
import CreateAITwinForm from "@/components/dashboard/CreateAITwinForm";

export default function CreationSection({ address, onUpload }: { 
  address: string;
  onUpload: (hash: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="w-full mb-12">
      {!showForm ? (
        <div className="flex justify-center">
          <button 
            onClick={() => setShowForm(true)}
            className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-gray-100 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-indigo-500/20"
          >
            <span className="relative z-10 flex items-center">
              <span className="mr-2">+</span>
              Create New AI Twin
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-20 transition-opacity" />
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
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