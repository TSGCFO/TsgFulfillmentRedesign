import React from 'react';
import logoLight from '../assets/tsg-logo.png';
import logoDark from '../assets/tsg-logo-white.png';

interface LogoProps {
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ theme = 'light' }) => {
  const logoSrc = theme === 'light' ? logoLight : logoDark;

  return (
    <div className="flex items-center">
      <img 
        src={logoSrc} 
        alt="TSG Fulfillment Services Inc" 
        className="h-14 w-auto" 
      />
    </div>
  );
};

export default Logo;
