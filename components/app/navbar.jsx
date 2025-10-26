'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Navigation data with categories and links
const navCategories = [
  {
    id: 'agent-luffy',
    text: 'Agent Luffy',
    href: '/',
    icon: '🏠',
    description: 'Main dashboard'
  },
  {
    id: 'admissions-academics',
    text: 'Admissions & Academics',
    icon: '📝',
    children: [
      { 
        id: 'exam-timetable', 
        text: 'Exam Timetable', 
        href: '/AdmissionsAcademics/examtimetable', 
        icon: '📅',
        description: 'View and manage exam schedules'
      }
    ]
  },
  {
    id: 'events-activities',
    text: 'Events & Activities',
    icon: '🎉',
    children: [
      { 
        id: 'club-details', 
        text: 'Club Details', 
        href: '/EventsActivities/get_club_details', 
        icon: '🏫',
        description: 'Information about student clubs'
      },
      { 
        id: 'upcoming-events', 
        text: 'Upcoming Events', 
        href: '/EventsActivities/UpcomingEvents', 
        icon: '📅',
        description: 'See upcoming campus events'
      }
    ]
  },
  {
    id: 'student-assistance',
    text: 'Student Assistance',
    icon: '🛟',
    children: [
      { 
        id: 'helpdesk-request', 
        text: 'Helpdesk Request', 
        href: '/StudentAssistance/HelpdeskRequest', 
        icon: '❓',
        description: 'Submit helpdesk requests'
      },
      { 
        id: 'manage-helpdesk', 
        text: 'Manage Helpdesk Requests', 
        href: '/StudentAssistance/ManageHelpdeskRequests', 
        icon: '🛠️',
        description: 'Manage and track helpdesk tickets'
      },
      { 
        id: 'manage-complaint', 
        text: 'Manage Complaint', 
        href: '/StudentAssistance/managepage', 
        icon: '📋',
        description: 'Manage and respond to complaints'
      },
      { 
        id: 'submit-complaint', 
        text: 'Submit Complaint', 
        href: '/StudentAssistance/sumbitpage', 
        icon: '✍️',
        description: 'Submit a new complaint'
      }
    ]
  },
  {
    id: 'login',
    text: 'Login',
    href: '/login',
    icon: '🔑',
    description: 'Access your account'
  }
];

// Create a motion-enhanced Link component instead of nesting <a> tags
const MotionLink = motion(Link);

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const pathname = usePathname();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
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
              : "flex w-80 flex-col rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl"
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
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2">
                {navCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ 
                      delay: 0.1 + (index * 0.05),
                      ...springTransition 
                    }}
                  >
                    {category.children ? (
                      // Category with children
                      <>
                        <motion.div
                          onClick={() => toggleCategory(category.id)}
                          whileHover={{ 
                            x: 4,
                            filter: "blur(0px)",
                            transition: { type: "spring", stiffness: 300, damping: 20 }
                          }}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer",
                            pathname.startsWith(`/${category.id.split('-')[0]}`) 
                              ? "bg-primary/20 text-primary shadow-lg backdrop-blur-sm" 
                              : "text-foreground/80 hover:bg-background/10 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <motion.span 
                              className="text-xl"
                              whileHover={{ 
                                scale: 1.1,
                                filter: "blur(0px)",
                                transition: springTransition
                              }}
                            >
                              {category.icon}
                            </motion.span>
                            <span className="font-medium">{category.text}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedCategories[category.id] ? 90 : 0 }}
                            transition={springTransition}
                          >
                            <svg 
                              className="w-4 h-4" 
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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </motion.div>
                        </motion.div>
                        
                        <AnimatePresence>
                          {expandedCategories[category.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0, filter: "blur(3px)" }}
                              animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                              exit={{ height: 0, opacity: 0, filter: "blur(3px)" }}
                              transition={{ ...springTransition, duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-8 mt-1 space-y-1">
                                {category.children.map((child, childIndex) => (
                                  <motion.div
                                    key={child.id}
                                    initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                    transition={{ 
                                      delay: 0.1 + (childIndex * 0.03),
                                      ...springTransition 
                                    }}
                                  >
                                    <MotionLink
                                      href={child.href}
                                      onClick={handleLinkClick}
                                      whileHover={{ 
                                        x: 4,
                                        filter: "blur(0px)",
                                        transition: { type: "spring", stiffness: 300, damping: 20 }
                                      }}
                                      className={cn(
                                        "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300",
                                        pathname === child.href 
                                          ? "bg-primary/20 text-primary shadow-lg backdrop-blur-sm" 
                                          : "text-foreground/80 hover:bg-background/10 hover:text-foreground"
                                      )}
                                    >
                                      <motion.span 
                                        className="text-lg"
                                        whileHover={{ 
                                          scale: 1.1,
                                          filter: "blur(0px)",
                                          transition: springTransition
                                        }}
                                      >
                                        {child.icon}
                                      </motion.span>
                                      <span className="font-medium text-sm">{child.text}</span>
                                    </MotionLink>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      // Standalone item
                      <MotionLink
                        href={category.href}
                        onClick={handleLinkClick}
                        whileHover={{ 
                          x: 4,
                          filter: "blur(0px)",
                          transition: { type: "spring", stiffness: 300, damping: 20 }
                        }}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                          pathname === category.href 
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
                          {category.icon}
                        </motion.span>
                        <span className="font-medium">{category.text}</span>
                      </MotionLink>
                    )}
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
                  <span className="text-sm">Agent Luffy v1.0.0</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}