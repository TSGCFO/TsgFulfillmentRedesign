import React from 'react';

interface LogoProps {
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ theme = 'light' }) => {
  const logoColor = theme === 'light' ? '#0056B3' : '#FFFFFF';
  const textColor = theme === 'light' ? 'text-primary' : 'text-white';
  const subtextColor = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="flex items-center">
      <div className={theme === 'light' ? 'text-primary' : 'text-white'}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" rx="8" fill={logoColor} fillOpacity={theme === 'dark' ? '0.2' : '1'} />
          <path d="M14 18H34M14 24H34M14 30H34" stroke={theme === 'light' ? 'white' : 'white'} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 14V34" stroke={theme === 'light' ? 'white' : 'white'} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="ml-3">
        <h1 className={`text-xl font-semibold font-poppins ${textColor}`}>
          TSG<span className={`font-normal ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>Fulfillment</span>
        </h1>
        <p className={`text-xs ${subtextColor} font-opensans`}>We work to solve your issues</p>
      </div>
    </div>
  );
};

export default Logo;
