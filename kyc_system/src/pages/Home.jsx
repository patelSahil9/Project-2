import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    // Hero section entrance animation
    gsap.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
    );

    // Title animation
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
    );

    // Subtitle animation
    gsap.fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
    );

    // CTA button animation
    gsap.fromTo(ctaRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay: 0.7, ease: "back.out(1.7)" }
    );

    // Features section scroll animation
    if (featuresRef.current) {
      gsap.fromTo(featuresRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  }, []);

  const handleButtonHover = (e) => {
    gsap.to(e.target, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleButtonLeave = (e) => {
    gsap.to(e.target, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div ref={heroRef} className="container mx-auto px-6 py-20 text-center">
        <h1 ref={titleRef} className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Secure KYC Verification
        </h1>
        <p ref={subtitleRef} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your Know Your Customer process with our blockchain-powered verification system. 
          Fast, secure, and compliant.
        </p>
        <Link 
          ref={ctaRef}
          to="/login" 
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          onMouseEnter={handleButtonHover}
          onMouseLeave={handleButtonLeave}
        >
          Get Started
        </Link>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose BlockKYC?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Secure & Compliant",
              description: "Bank-grade security with full regulatory compliance",
              icon: "🔒"
            },
            {
              title: "Fast Processing",
              description: "Complete verification in minutes, not days",
              icon: "⚡"
            },
            {
              title: "Blockchain Powered",
              description: "Immutable records with transparent audit trails",
              icon: "🔗"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => {
                gsap.to(e.target, {
                  y: -10,
                  scale: 1.02,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.target, {
                  y: 0,
                  scale: 1,
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: "10K+", label: "Verifications" },
              { number: "99.9%", label: "Accuracy" },
              { number: "< 5min", label: "Processing Time" },
              { number: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="transform hover:scale-110 transition-transform duration-300"
                onMouseEnter={(e) => {
                  gsap.to(e.target, {
                    scale: 1.1,
                    duration: 0.2,
                    ease: "power2.out"
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.target, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power2.out"
                  });
                }}
              >
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;