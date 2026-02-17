
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", showText = true, light = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className="relative flex-shrink-0">
        <div className={`${light ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} p-2 rounded-2xl shadow-lg ${light ? 'shadow-white/10' : 'shadow-blue-200'} transition-transform hover:scale-105 duration-300`}>
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 fill-current" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Minimalist Home + Pot Concept */}
            <path d="M12 2L3 8V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V8L12 2ZM19 20H5V9.5L12 4.8L19 9.5V20Z" opacity="0.4" />
            <path d="M8 12C8 10.8954 8.89543 10 10 10H14C15.1046 10 16 10.8954 16 12V15C16 17.2091 14.2091 19 12 19C9.79086 19 8 17.2091 8 15V12Z" />
            <path d="M7 11H17V12H7V11Z" />
          </svg>
        </div>
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${light ? 'bg-blue-300' : 'bg-blue-400'} rounded-full animate-pulse`} />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-2xl font-black tracking-tight ${light ? 'text-white' : 'text-blue-600'}`}>
            أسماء
          </span>
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.1em] ${light ? 'text-blue-100' : 'text-gray-500'}`}>
            للأدوات المنزلية
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
