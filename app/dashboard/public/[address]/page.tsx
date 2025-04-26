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
    <main className="min-h-screen bg-gray-900">
      {/* Fixed Header Section */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-indigo-300 transition-colors group"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
              </button>

              <div className="mt-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Public AI Models
                </h1>
                <p className="mt-2 text-gray-400">
                  Exploring publicly shared models by{" "}
                  <span className="font-mono text-indigo-400">{address}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="pt-40"> {/* Add padding-top to account for fixed header */}
        <section className="max-w-7xl mx-auto px-6 pb-12">
          <div className="rounded-xl border border-gray-700/50 bg-gray-900 p-6 backdrop-blur-lg">
            <PublicModelsList />
          </div>
        </section>
      </div>
    </main>
  );
}