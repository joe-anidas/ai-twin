"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PublicModelsList from "@/components/PublicModelsList";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PublicModelsPage() {
  const { address } = useParams<{ address: string }>();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleBack = () => {
    router.push(`/dashboard/${address}`);
  };

  if (!isMounted) return null;

  return (
    <main className="min-h-screen bg-gray-900"> {/* Updated background */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-6 flex items-center space-x-2 text-gray-400 hover:text-indigo-300 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Title Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
                Public AI Models
              </h1>
              <p className="mt-2 text-gray-400">
                Exploring publicly shared models by{" "}
                <span className="font-mono text-indigo-400">{address}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Models List Container - Now matches CloneCard background */}
        <div className="rounded-xl border border-gray-700/50 bg-gray-900 p-6 backdrop-blur-lg">
          <PublicModelsList />
        </div>
      </section>
    </main>
  );
}