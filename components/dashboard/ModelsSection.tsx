// components/ModelsSection.tsx
import ModelCard from "@/components/dashboard/ModelCard";

export default function ModelsSection({ 
  localModels, 
  mintingInProgress, 
  onMint 
}: {
  localModels: string[];
  mintingInProgress: string | null;
  onMint: (hash: string) => void;
}) {
  return (
    <section className="w-full space-y-8">
      <h2 className="text-3xl font-bold text-gray-100 mb-6">
        🌟 Your AI Models
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {localModels.map((model, index) => (
          <ModelCard
            key={index}
            model={model}
            index={index}
            isMinting={mintingInProgress === model}
            onMint={onMint}
          />
        ))}
        
        {localModels.length === 0 && (
          <div className="col-span-full text-center py-12 space-y-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
            <p className="text-xl text-gray-400">
              🚀 No unminted models detected
            </p>
            <p className="text-sm text-gray-500">
              Create a new model to begin your cosmic journey
            </p>
          </div>
        )}
      </div>
    </section>
  );
}