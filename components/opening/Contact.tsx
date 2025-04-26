import Footer from "./Footer";

export default function ContactSection() {
  return (
    <>
      <section className="py-12 md:py-20 lg:py-24 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-purple-500/10 animate-pulse"></div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8 lg:gap-12">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-blue-500/20 border border-blue-500/30 rounded-full mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm font-medium text-blue-400">
                    Support
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                  Get Help with Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">AI Twin</span>
                </h2>
                <p className="text-slate-300 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto md:mx-0">
                  Reach out to learn more about creating and customizing your personal AI model with our platform.
                </p>
                <div className="flex justify-center md:justify-start">
                  <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/20 text-sm sm:text-base">
                    Contact Support
                  </button>
                </div>
              </div>
              <div className="flex-1 flex justify-center mt-6 md:mt-0">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 backdrop-blur-sm">
                  <div className="absolute inset-0 rounded-full bg-slate-800/80 border border-blue-500/30 flex items-center justify-center">
                    <div className="text-white text-3xl sm:text-4xl">✦</div>
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