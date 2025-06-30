import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

const Navbar = () => {
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    // Navbar entrance animation
    gsap.fromTo(navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    );

    // Logo animation
    gsap.fromTo(logoRef.current,
      { x: 10, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" }
    );

    // Links stagger animation
    const links = linksRef.current.children;
    gsap.fromTo(links,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.4, ease: "power2.out" }
    );
  }, []);

  const handleLinkHover = (e) => {
    gsap.to(e.target, {
      scale: 1.05,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const handleLinkLeave = (e) => {
    gsap.to(e.target, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <nav ref={navRef} className="bg-white shadow sticky top-0 z-50 w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <h1 ref={logoRef} className="text-2xl font-bold text-blue-700 tracking-wide cursor-pointer transition-all duration-300 ease-in-out hover:text-blue-900 hover:scale-105"
            onMouseEnter={handleLinkHover}
            onMouseLeave={handleLinkLeave}>
          BlockKYC
        </h1>
        <div ref={linksRef} className="flex gap-6 md:gap-4 text-base font-medium">
          <Link to="/" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Home
          </Link>
          <Link to="/dashboard" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Dashboard
          </Link>
          <Link to="/upload" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Upload KYC
          </Link>
          <Link to="/profile" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Profile
          </Link>
          <Link to="/admin" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Admin
          </Link>
          <Link to="/login" 
                className="text-blue-700 hover:bg-blue-700 hover:text-white px-4 py-2 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 hover:-translate-y-1 border border-transparent hover:border-blue-600"
                onMouseEnter={handleLinkHover}
                onMouseLeave={handleLinkLeave}>
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;