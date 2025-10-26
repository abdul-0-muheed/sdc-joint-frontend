// components/LiveKitTextDisplay.jsx
'use client';

import { useEffect, useState, useContext, useRef } from 'react';
import { RoomContext } from '@livekit/components-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const LiveKitMessageCloud = () => {
  const [messageData, setMessageData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const room = useContext(RoomContext);
  const timeoutRef = useRef(null);

  // Clear timeout on unmount or new message
  const scheduleAutoHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setMessageData(null);
    }, 6000); // 6 seconds
  };

 useEffect(() => {
    
    if (!room) return;

    const handleTextStream = async (reader, participantInfo) => {
      const info = reader.info;
      console.log(
        `Received text stream from ${participantInfo.identity}\n` +
        `  Topic: ${info.topic}\n` +
        `  Timestamp: ${info.timestamp}\n` +
        `  ID: ${info.id}\n` +
        `  Size: ${info.size || 'N/A'}`
      );

      try {
        const text = await reader.readAll();
        const parsedData = JSON.parse(text);

        // Show new message immediately (even if one is already visible)
        setMessageData(parsedData);
        setIsVisible(true);
        scheduleAutoHide(); // Reset 6s timer
      } catch (error) {
        console.error('Error processing text stream:', error);
      }
    };

    room.registerTextStreamHandler('cloud-message', handleTextStream);

    return () => {
      room.unregisterTextStreamHandler('cloud-message', handleTextStream);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [room]);

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setMessageData(null);
  };

  if (!isVisible || !messageData) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95, filter: 'blur(3px)' }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          filter: 'blur(0px)',
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }}
        exit={{ 
          opacity: 0, 
          y: -5, 
          scale: 0.98, 
          filter: 'blur(2px)',
          transition: { duration: 0.3 }
        }}
        className="fixed top-20 left-[950px] transform -translate-x-1/2 z-[1000] w-full max-w-xs px-4"
      >
        {/* Cloud-like container */}
        <div
          className={cn(
            'relative w-full rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-xl',
            'shadow-xl overflow-hidden'
          )}
          style={{
            boxShadow:
              '0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Soft inner padding for cloud feel */}
          <div className="p-5 relative">
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-foreground/50 hover:text-foreground transition-colors"
              aria-label="Close notification"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-lg font-semibold text-foreground mb-1.5">
              {messageData.headline || 'Message'}
            </h2>
            <p className="text-foreground/80 text-sm leading-relaxed">
              {messageData.text || 'You have a new notification.'}
            </p>

            {messageData.link && (
              <motion.a
                href={messageData.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                  'bg-primary/20 text-primary hover:bg-primary/30',
                  'backdrop-blur-sm transition-colors'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {messageData.linkText || 'View'}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </motion.a>
            )}
          </div>

          {/* Optional: subtle floating animation */}
          <motion.div
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            animate={{ y: [0, -2, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveKitMessageCloud;