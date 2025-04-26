import { Brain, Shield, Share2 } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Create AI Models",
      icon: Brain,
      description: "Build custom AI mentors, tutors, or chatbots by typing text prompts or uploading your own files for training.",
      bgColor: "bg-slate-800/80",
      textColor: "text-white",
      borderColor: "border-blue-500/30"
    },
    {
      title: "Privacy Options",
      icon: Shield,
      description: "Make your AI model private for personal use or public for everyone to view and interact with.",
      bgColor: "bg-slate-800/80",
      textColor: "text-white",
      borderColor: "border-purple-500/30"
    },
    {
      title: "NFT Ownership",
      icon: Share2,
      description: "Mint your AI model as an NFT on Base blockchain for verifiable ownership and transferability.",
      bgColor: "bg-slate-800/80",
      textColor: "text-white",
      borderColor: "border-blue-400/30"
    }
  ];

  return (
    <section className="py-16 md:py-24 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-400">
              Features & Benefits
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Build Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">AI Twin</span>
          </h3>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Harness the power of Base, Groq and Fluvio to create customized AI models that learn and adapt to your specific needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} border ${feature.borderColor} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2 shadow-xl backdrop-blur-sm`}
            >
              <div className="p-8 h-full">
                <div className="flex flex-col h-full">
                  <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center">
                    <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${feature.textColor}`}>
                    {feature.title}
                  </h3>
                  <p className={`${feature.textColor} opacity-80 mb-6 flex-grow text-sm md:text-base`}>
                    {feature.description}
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}