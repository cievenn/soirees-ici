import React from 'react';

const Button = ({ children, variant = "primary", className = "", onClick, icon = false }) => {
  const base = "px-8 py-5 rounded-[2rem] font-['Plus_Jakarta_Sans'] font-extrabold text-sm tracking-[0.1em] uppercase transition-all duration-500 flex items-center justify-center gap-3 relative group overflow-hidden";
  
  if (variant === "primary") {
    return (
      <button onClick={onClick} className={`${base} bg-black text-white hover:scale-105 hover:shadow-[0_20px_40px_-10px_rgba(255,0,127,0.4)] ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff007f] via-[#ff7f00] to-[#ff007f] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"></div>
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
  return (
    <button onClick={onClick} className={`${base} bg-transparent text-black border-2 border-black/10 hover:border-[#ff007f] hover:text-[#ff007f] ${className}`}>
      {children}
    </button>
  );
};

export default Button;
