import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { Check, ArrowRight, Play } from 'lucide-react';

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const microRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card entrance animation
      gsap.fromTo(cardRef.current,
        { y: 40, rotateX: 8, scale: 0.96, opacity: 0 },
        { y: 0, rotateX: 2, scale: 1, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
      );

      // Headline animation
      gsap.fromTo(headlineRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', delay: 0.5 }
      );

      // Subline animation
      gsap.fromTo(sublineRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.7 }
      );

      // Micro copy animation
      gsap.fromTo(microRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.9 }
      );

      // Waveform bars animation
      gsap.fromTo('.waveform-bar',
        { scaleY: 0.2 },
        { scaleY: 1, duration: 0.6, stagger: 0.01, ease: 'power2.out', delay: 0.6 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-[#07080A] relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 55% 45%, rgba(77,255,206,0.10) 0%, transparent 55%), #07080A'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4DFFCE] to-[#2DD4A0] flex items-center justify-center">
            <span className="text-sm font-bold text-[#07080A]">R</span>
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">Resona</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link to="#" className="text-sm text-white/60 hover:text-white transition-colors">Product</Link>
          <Link to="#" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link to="#" className="text-sm text-white/60 hover:text-white transition-colors">Docs</Link>
          <Link to="/sign-in" className="text-sm text-white/60 hover:text-white transition-colors">Sign In</Link>
        </div>
        
        <Link to="/sign-up" className="btn-primary text-sm">
          Start free
        </Link>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 lg:px-12 py-12">
        {/* Agent Card */}
        <div 
          ref={cardRef}
          className="glass-card w-full max-w-[720px] p-6 lg:p-8 mb-12"
          style={{ 
            transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)',
            opacity: 0 
          }}
        >
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left side - Agent info */}
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-[#4DFFCE]/20 to-[#2DD4A0]/10 flex items-center justify-center border border-[#4DFFCE]/30">
                  <span className="text-2xl lg:text-3xl font-semibold text-[#4DFFCE]">M</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#07080A] flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4DFFCE] animate-pulse" />
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Maya</h3>
                <p className="text-sm text-white/50">Support Agent</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="status-dot" />
                  <span className="text-xs text-[#4DFFCE] font-medium uppercase tracking-wider">Live</span>
                </div>
              </div>
            </div>

            {/* Right side - Waveform & CTA */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Waveform */}
              <div className="flex items-center justify-center gap-1 h-16 mb-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="waveform-bar w-1 rounded-full bg-[#4DFFCE]/30"
                    style={{
                      height: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>

              <Link 
                to="/sign-up" 
                className="btn-primary w-full lg:w-auto self-start"
              >
                <Play size={16} />
                Create an agent
              </Link>
            </div>
          </div>
        </div>

        {/* Headlines */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 
            ref={headlineRef}
            className="text-4xl lg:text-6xl font-semibold text-white mb-6 leading-tight"
            style={{ opacity: 0 }}
          >
            AI voice agents that{' '}
            <span className="text-[#4DFFCE]">actually sound human.</span>
          </h1>
          
          <p 
            ref={sublineRef}
            className="text-lg lg:text-xl text-white/60 mb-8 max-w-2xl mx-auto"
            style={{ opacity: 0 }}
          >
            Design, test, and deploy voice agents in minutes—no code required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link to="/sign-up" className="btn-primary w-full sm:w-auto">
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link to="/sign-in" className="btn-secondary w-full sm:w-auto">
              I already have an account
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#4DFFCE]" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#4DFFCE]" />
              Free tier available
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-[#4DFFCE]" />
              Cancel anytime
            </span>
          </div>

          <p 
            ref={microRef}
            className="text-sm text-white/40 mt-12"
            style={{ opacity: 0 }}
          >
            Built for support, sales, and operations teams.
          </p>
        </div>
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
