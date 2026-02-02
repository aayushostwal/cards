import { useState } from 'react';
import { CreditCard, Sparkles, ArrowRight, Zap, Shield, Gift, Plane } from 'lucide-react';

interface HomePageProps {
  onEnter: () => void;
  onSkipNextTime: (skip: boolean) => void;
}

export function HomePage({ onEnter, onSkipNextTime }: HomePageProps) {
  const [skipChecked, setSkipChecked] = useState(false);

  const handleEnter = () => {
    onSkipNextTime(skipChecked);
    onEnter();
  };

  const features = [
    { icon: Zap, title: '50+ Cards', desc: 'All major Indian banks' },
    { icon: Shield, title: '35+ Parameters', desc: 'Deep comparison' },
    { icon: Gift, title: 'AI Powered', desc: 'Smart recommendations' },
    { icon: Plane, title: 'Travel Benefits', desc: 'Lounge access & more' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Floating cards decoration */}
      <div className="absolute top-20 left-10 sm:left-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
        <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg transform -rotate-12 opacity-80" />
      </div>
      <div className="absolute top-32 right-10 sm:right-32 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
        <div className="w-14 h-9 sm:w-18 sm:h-11 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg shadow-lg transform rotate-12 opacity-80" />
      </div>
      <div className="absolute bottom-32 left-10 sm:left-32 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>
        <div className="w-12 h-8 sm:w-16 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-lg transform rotate-6 opacity-80" />
      </div>
      <div className="absolute bottom-20 right-10 sm:right-20 animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
        <div className="w-14 h-9 sm:w-18 sm:h-11 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-lg transform -rotate-6 opacity-80" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/30">
            <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          <span className="text-white">Card</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Compare</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-blue-200 mb-2 font-medium">
          Find Your Perfect Credit Card 💳
        </p>
        <p className="text-slate-400 mb-8 text-sm sm:text-base">
          Compare 50+ Indian credit cards across fees, rewards, lounges & more
        </p>

        {/* Feature pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center"
            >
              <feature.icon className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-white text-sm font-semibold">{feature.title}</p>
              <p className="text-slate-400 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleEnter}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 hover:shadow-blue-500/40"
        >
          <Sparkles className="w-5 h-5" />
          Start Comparing
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Skip checkbox */}
        <label className="flex items-center justify-center gap-2 mt-6 cursor-pointer group">
          <input
            type="checkbox"
            checked={skipChecked}
            onChange={(e) => setSkipChecked(e.target.checked)}
            className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">
            Don't show this page again
          </span>
        </label>
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-4 text-slate-500 text-xs">
        Made with ❤️ for Indian cardholders
      </p>
    </div>
  );
}
