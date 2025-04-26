import Footer from "./Footer";

export default function ContactSection() {
  return (
    <>
      <section className="py-16 md:py-24 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-4">
                  <span className="text-sm font-medium text-blue-400">
                    Support
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Get Help with Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">AI Twin</span>
                </h2>
                <p className="text-slate-300 mb-6">
                  Reach out to learn more about creating and customizing your personal AI model with our platform.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-medium shadow-xl hover:shadow-blue-500/20">
                  Contact Support
                </button>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-48 h-48 backdrop-blur-sm">
                  <div className="absolute inset-0 rounded-full bg-slate-800/80 border border-blue-500/30 flex items-center justify-center">
                    <div className="text-white text-4xl">✦</div>
                  </div>
                  <div className="absolute inset-0 border-2 border-[#B9FF66] rounded-full animate-[spin_20s_linear_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}