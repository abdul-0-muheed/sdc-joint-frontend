// chat-transcript.tsx
'use client';

import { AnimatePresence, type HTMLMotionProps, motion } from 'motion/react';
import { type ReceivedChatMessage } from '@livekit/components-react';
import { ChatEntry } from '@/components/livekit/chat-entry';
import { useEffect, useState } from 'react';

const MotionContainer = motion.create('div');
const MotionChatEntry = motion.create(ChatEntry);

const CONTAINER_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      transition: {
        ease: 'easeOut',
        duration: 0.3,
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        ease: 'easeOut',
        duration: 0.3,
        stagerDelay: 0.2,
        staggerChildren: 0.1,
        staggerDirection: 1,
      },
    },
  },
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
};

const MESSAGE_MOTION_PROPS = {
  variants: {
    hidden: {
      opacity: 0,
      translateY: 10,
    },
    visible: {
      opacity: 1,
      translateY: 0,
    },
  },
};

interface ChatTranscriptProps {
  hidden?: boolean;
  messages?: ReceivedChatMessage[];
}

export function ChatTranscript({
  hidden = false,
  messages = [],
  ...props
}: ChatTranscriptProps & Omit<HTMLMotionProps<'div'>, 'ref'>) {
  // Create a state to hold the messages that will be updated
  const [displayMessages, setDisplayMessages] = useState<ReceivedChatMessage[]>([]);
  
  // Debug logging
  console.log('ChatTranscript received messages:', messages);
  
  // Update displayMessages when the messages prop changes
  useEffect(() => {
    console.log('Updating displayMessages:', messages);
    setDisplayMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (displayMessages.length > 0) {
      const container = document.querySelector('[data-lk-scroll-area="viewport"]');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [displayMessages]);

  return (
    <AnimatePresence>
      {!hidden && (
        <>
          {/* Custom scrollbar styles */}
          <style jsx>{`
            /* Custom scrollbar styling */
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 10px;
            }
            
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
            
            /* Alternative: Hide scrollbar completely */
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            
            .hide-scrollbar {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          `}</style>
          
          <MotionContainer 
            {...CONTAINER_MOTION_PROPS} 
            {...props}
            className="space-y-4" // Increased spacing between messages
          >
            {displayMessages.length === 0 ? (
              <div className="text-center text-foreground py-6">
                {/* Empty */}
              </div>
            ) : (
              displayMessages.map(({ id, timestamp, from, message, editTimestamp }: ReceivedChatMessage) => {
                const locale = navigator?.language ?? 'en-US';
                const messageOrigin = from?.isLocal ? 'local' : 'remote';
                const hasBeenEdited = !!editTimestamp;

                // Debug logging
                console.log('Rendering message:', { id, message, messageOrigin });

                return (
                  <motion.div
                    key={id}
                    className={`p-4 rounded-2xl shadow-sm ${
                      messageOrigin === 'local' 
                        ? 'bg-primary/20 ml-8' 
                        : 'bg-secondary/20 mr-8'
                    }`}
                    variants={MESSAGE_MOTION_PROPS}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-foreground text-sm leading-relaxed flex-1">
                        {message}
                      </div>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(timestamp).toLocaleTimeString(locale, { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    {hasBeenEdited && (
                      <div className="text-xs text-muted-foreground mt-2 ml-1">
                        (edited)
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </MotionContainer>
        </>
      )}
    </AnimatePresence>
  );
}