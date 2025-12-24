"use client";
import React, { useState, useRef } from 'react';
// use your own icon import if react-icons is not available
import { GoArrowUpRight } from 'react-icons/go';
import './CardNav.css';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
  onClick?: () => void;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo: string;
  logoAlt?: string;
  items: CardNavItem[];
  className?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  hideNav?: boolean;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  baseColor = 'rgba(255, 255, 255, 0.1)',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  ctaLabel = 'Get Started',
  onCtaClick,
  hideNav = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  const toggleMenu = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`card-nav-container ${className} ${hideNav && !isExpanded ? 'hidden-nav' : ''}`}
    >
      <nav 
        ref={navRef} 
        className={`card-nav ${isExpanded ? 'open' : ''}`} 
        // We override background color via CSS for the glass effect, but keep style prop for overrides if strictly needed, 
        // though for liquid glass we prefer the CSS implementation.
      >
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isExpanded ? 'open' : ''}`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#fff' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <img src={logo} alt={logoAlt} className="logo" />
          </div>

          <button
            type="button"
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={onCtaClick}
          >
            {ctaLabel}
          </button>
        </div>

        <div className="card-nav-grid-wrapper">
            <div className="card-nav-content" aria-hidden={!isExpanded}>
            {(items || []).slice(0, 3).map((item, idx) => (
                <div
                key={`${item.label}-${idx}`}
                className="nav-card"
                style={{ backgroundColor: item.bgColor, color: item.textColor }}
                >
                <div className="nav-card-label">{item.label}</div>
                <div className="nav-card-links">
                    {item.links?.map((lnk, i) => (
                    <a
                        key={`${lnk.label}-${i}`}
                        className="nav-card-link"
                        href={lnk.href}
                        aria-label={lnk.ariaLabel}
                        onClick={(e) => {
                        if (lnk.onClick) {
                            e.preventDefault();
                            lnk.onClick();
                        }
                        }}
                    >
                        <GoArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                        {lnk.label}
                    </a>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
      </nav>
    </div>
  );
};

export default CardNav;
