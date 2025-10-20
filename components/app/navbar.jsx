'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Navigation data with links
const navItems = [
  { id: 1, text: 'Home', href: '/', icon: '🏠' },
  { id: 2, text: 'Dashboard', href: '/dashboard', icon: '📊' },
  { id: 3, text: 'Analytics', href: '/analytics', icon: '📈' },
  { id: 4, text: 'Settings', href: '/settings', icon: '⚙️' },
  { id: 5, text: 'Profile', href: '/profile', icon: '👤' },
];

// Create a motion-enhanced Link component instead of nesting <a> tags
const MotionLink = motion(Link);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // iOS-style spring animation with blur
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1,
    // Add blur transition
    filter: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  };

  return (
    <div className="fixed left-6 top-6 z-50">
      <AnimatePresence mode="sync">
        <motion.div
          layout
          layoutId="navbar-container"
          initial={{ filter: "blur(0px)" }}
          animate={{ filter: "blur(0px)" }}
          transition={{
            ...springTransition,
            layout: {
              type: "spring",
              stiffness: 300,
              damping: 25
            }
          }}
          className={cn(
            "relative overflow-hidden",
            !isOpen 
              ? "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl" 
              : "flex w-64 flex-col rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl"
          )}
          style={{
            boxShadow: !isOpen 
              ? "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)" 
              : "0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.08)"
          }}
        >
          {!isOpen ? (
            // Closed state - iOS-style pill button
            <motion.button
              layoutId="navbar-content"
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center p-4"
              whileHover={{ 
                scale: 1.02,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 400, damping: 25 }
              }}
              whileTap={{ 
                scale: 0.95,
                filter: "blur(1px)",
                transition: { type: "spring", stiffness: 500, damping: 15 }
              }}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={springTransition}
              >
                <svg 
                  className="w-6 h-6 text-foreground" 
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeWidth="2.5" 
                    d="M5 7h14M5 12h14M5 17h14"
                  />
                </svg>
              </motion.div>
            </motion.button>
          ) : (
            // Open state - iOS-style menu
            <motion.div
              layoutId="navbar-content"
              className="flex flex-col p-6"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={springTransition}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <motion.h2 
                  className="text-xl font-semibold text-foreground"
                  initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1, ...springTransition }}
                >
                  Navigation
                </motion.h2>
                <motion.button
                  whileHover={{ 
                    scale: 1.1,
                    filter: "blur(0px)",
                    transition: { type: "spring", stiffness: 400, damping: 25 }
                  }}
                  whileTap={{ 
                    scale: 0.9,
                    filter: "blur(1px)",
                    transition: { type: "spring", stiffness: 500, damping: 15 }
                  }}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl p-2 bg-background/10 backdrop-blur-sm"
                >
                  <svg 
                    className="w-5 h-5 text-foreground" 
                    aria-hidden="true" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      stroke="currentColor" 
                      strokeLinecap="round" 
                      strokeWidth="2.5" 
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              </div>
              
              {/* Navigation items with staggered animation */}
              <div className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 0.1 + (index * 0.05),
                      ...springTransition 
                    }}
                  >
                    <MotionLink
                      href={item.href}
                      onClick={handleLinkClick}
                      whileHover={{ 
                        x: 4,
                        filter: "blur(0px)",
                        transition: { type: "spring", stiffness: 300, damping: 20 }
                      }}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300",
                        pathname === item.href 
                          ? "bg-primary/20 text-primary shadow-lg backdrop-blur-sm" 
                          : "text-foreground/80 hover:bg-background/10 hover:text-foreground"
                      )}
                    >
                      <motion.span 
                        className="text-xl"
                        whileHover={{ 
                          scale: 1.1,
                          filter: "blur(0px)",
                          transition: springTransition
                        }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="font-medium">{item.text}</span>
                    </MotionLink>
                  </motion.div>
                ))}
              </div>
              
              {/* Footer */}
              <motion.div 
                className="mt-auto pt-6 border-t border-foreground/10"
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.3, ...springTransition }}
              >
                <div className="flex items-center gap-3 px-4 py-3 text-foreground/60">
                  <span className="text-lg">🌐</span>
                  <span className="text-sm">v1.0.0</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}