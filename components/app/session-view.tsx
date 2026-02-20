// session-view.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { AppConfig } from '@/app-config';
import { ChatTranscript } from '@/components/app/chat-transcript';
import { PreConnectMessage } from '@/components/app/preconnect-message';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConnectionTimeout } from '@/hooks/useConnectionTimout';
import { useDebugMode } from '@/hooks/useDebug';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../livekit/scroll-area/scroll-area';
import { ChatInput } from '@/components/livekit/agent-control-bar/chat-input';
import { useChat, useRemoteParticipants, useTranscriptions } from '@livekit/components-react';
import dynamic from 'next/dynamic';
import StateBasedVideo from '@/components/app/tile-layout';
import LiveKitMessageCloud from '@/components/app/LiveKitMessageCloud';


// Dynamically import AgentControlBar to avoid potential circular dependencies
const AgentControlBar = dynamic(
  () => import('@/components/livekit/agent-control-bar/agent-control-bar').then((mod) => mod.AgentControlBar),
  { ssr: false, loading: () => <div className="p-3">Loading controls...</div> }
);

const MotionBottom = motion.create('div');

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';
const BOTTOM_VIEW_MOTION_PROPS = {
  variants: {
    visible: {
      opacity: 1,
      translateY: '0%',
    },
    hidden: {
      opacity: 0,
      translateY: '100%',
    },
  },
  initial: 'hidden' as const,
  animate: 'visible' as const,
  exit: 'hidden' as const,
  transition: {
    duration: 0.3,
    delay: 0.5,
    ease: 'easeOut' as const,
  },
};

interface FadeProps {
  top?: boolean;
  bottom?: boolean;
  className?: string;
}

export function Fade({ top = false, bottom = false, className }: FadeProps) {
  return (
    <div
      className={cn(
        'from-background pointer-events-none h-4 bg-linear-to-b to-transparent',
        top && 'bg-linear-to-b',
        bottom && 'bg-linear-to-t',
        className
      )}
    />
  );
}
interface SessionViewProps {
  appConfig: AppConfig;
}

export const SessionView = ({
  appConfig,
  ...props
}: React.ComponentProps<'section'> & SessionViewProps) => {
  useConnectionTimeout(200_000);
  useDebugMode({ enabled: IN_DEVELOPMENT });

  // Get messages and transcriptions directly
  const hookMessages = useChatMessages();
  const transcriptions = useTranscriptions();
  const { send, chatMessages } = useChat();
  const participants = useRemoteParticipants();

  // Create a state for messages
  const [messages, setMessages] = useState<any[]>([]);

  // Use a ref to track if we've initialized
  const initializedRef = useRef(false);

  // Update messages when hookMessages or transcriptions change
  useEffect(() => {
    // Debug logging
    console.log('hookMessages:', hookMessages);
    console.log('transcriptions:', transcriptions);
    console.log('chatMessages:', chatMessages);

    // Update messages state
    setMessages(hookMessages);

    // Mark as initialized
    if (!initializedRef.current && hookMessages.length > 0) {
      initializedRef.current = true;
    }
  }, [hookMessages, transcriptions, chatMessages]);

  const handleSendMessage = async (message: string) => {
    console.log('Sending message:', message);
    try {
      await send(message);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const controls = {
    leave: true,
    microphone: true,
    chat: false,
    camera: false,
    screenShare: false,
  };

  const isAgentAvailable = participants.some((p) => p.isAgent);

  return (
    <section className="bg-background relative z-10 h-full w-full overflow-hidden" {...props}>
      {/* Main layout with padding to avoid overlapping with transcript */}
      <div className="flex h-full pr-96">
        {/* Left side - empty for now */}
        <div className="hidden md:block md:w-1/4"></div>

        {/* Center - Character area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Black div for character/video with margins */}
          <LiveKitMessageCloud />
          <div className=" w-[90%] h-[85vh] mt-8 mb-4 rounded-xl flex items-center justify-center shadow-2xl">
            {/* This is where you'll add the 3D character or video later */}

            <StateBasedVideo />
          </div>

          {/* Control buttons positioned above the character area */}
          <div className="absolute bottom-10 z-50">
            {AgentControlBar && (
              <AgentControlBar
                controls={controls}
                onChatOpenChange={() => { }} // Empty function since we don't need this functionality
              />
            )}
          </div>
        </div>
      </div>

      {/* Right side - Chat Transcript with navbar-like styling */}
      <div className="fixed right-10 top-10 bottom-10 w-80 z-40 ">
        <div className="h-full flex flex-col rounded-3xl border border-white/20 bg-background/90 backdrop-blur-xl overflow-hidden shadow-2xl mt-10px">
          {/* Header */}
          <div className="p-4 border-b border-border bg-background/80">
            <h2 className="text-lg font-semibold text-foreground">Transcript</h2>

          </div>

          {/* Transcript content with custom scrollbar */}
          <ScrollArea className="flex-1 p-4 bg-background/50 custom-scrollbar">
            <ChatTranscript
              messages={messages}
            />

            {/* Debug info - show if no messages */}
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No messages yet. Try sending a message or speaking.
              </div>
            )}
          </ScrollArea>

          {/* Message input section */}
          <div className="p-4 border-t border-border bg-background/80">
            <ChatInput
              chatOpen={true}
              isAgentAvailable={isAgentAvailable}
              onSend={handleSendMessage}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};