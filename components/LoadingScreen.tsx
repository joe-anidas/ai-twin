// components/LoadingScreen.tsx
"use client";
export const LoadingScreen = () => (
  <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-indigo-200 text-lg font-medium">Connecting Wallet...</p>
    </div>
  </div>
);  