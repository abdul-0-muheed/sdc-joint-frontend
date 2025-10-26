// CharacterVideo.tsx
import React, { useEffect, useState, useRef, CSSProperties } from 'react';
import { useVoiceAssistant } from '@livekit/components-react';

type AgentState = 'idle' | 'speaking' | 'thinking' | 'listening' | 'unknown';

const VIDEO_SOURCES: Record<AgentState, string> = {
  idle: 'idle1.mp4',
  speaking: 'speaking1.mp4',
  thinking: 'thinking1.mp4',
  listening: 'listening1.mp4',
  unknown: 'idle1.mp4', // Fallback
};

const CharacterVideo: React.FC = () => {
  const { state: lkAgentState } = useVoiceAssistant();
  const [currentVideoState, setCurrentVideoState] = useState<AgentState>('idle');
  const [isPlayingTransition, setIsPlayingTransition] = useState(false);

  const videoRefs = useRef<Record<AgentState, HTMLVideoElement | null>>({
    idle: null,
    speaking: null,
    thinking: null,
    listening: null,
    unknown: null,
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track ongoing play promises to handle interruptions gracefully
  const currentPlayPromiseRef = useRef<Promise<void> | null>(null);

  const conceptualState: AgentState = lkAgentState === 'listening'
    ? 'listening'
    : lkAgentState === 'thinking'
      ? 'thinking'
      : lkAgentState === 'speaking'
        ? 'speaking'
        : 'idle';

  useEffect(() => {
    if (conceptualState !== currentVideoState) {
      console.log(`State changed from ${currentVideoState} to ${conceptualState}. Preparing transition.`);
      setIsPlayingTransition(true);
    }
  }, [conceptualState, currentVideoState]);

  // Effect to manage video loading - runs only once
  useEffect(() => {
    console.log("Preloading videos...");
    Object.entries(VIDEO_SOURCES).forEach(([state, src]) => {
      const video = videoRefs.current[state as AgentState];
      if (video && video.src !== src) {
        video.src = src;
        video.load();
      }
    });
  }, []); // Empty dependency array

  // Effect to handle video playback and visibility
  useEffect(() => {
    const playVideoAtSpeed = async (video: HTMLVideoElement, speed: number, shouldLoop: boolean) => {
      if (!video) return;

      // Pause the video first if it's playing to reset state (important before setting currentTime)
      if (!video.paused) {
        video.pause();
        // Optionally, wait a tick to ensure pause is processed if needed
        // await new Promise(resolve => setTimeout(resolve, 0));
      }

      // Clear any previous play promise if it exists
      if (currentPlayPromiseRef.current) {
          // While we can't directly cancel a Promise, resolving/rejecting the previous one's
          // associated state helps manage expectations. The key is handling the *new* promise.
          currentPlayPromiseRef.current = null;
      }

      try {
        video.currentTime = 0; // Reset time for transitions or new state start
        video.playbackRate = speed;
        video.loop = shouldLoop;

        console.log(`Attempting to play video for state with speed ${speed}, loop ${shouldLoop}`);
        const playPromise = video.play();

        if (playPromise !== undefined) {
          // Store the current play promise
          currentPlayPromiseRef.current = playPromise.then(() => {
              console.log(`Successfully played video at ${speed}x, loop: ${shouldLoop}`);
              // Clear the ref on successful play
              if (currentPlayPromiseRef.current === playPromise) {
                  currentPlayPromiseRef.current = null;
              }
          }).catch(error => {
              // Check if the error is due to interruption (e.g., pause called)
              if (error.name === 'AbortError' || error.name === 'NotAllowedError') {
                  console.log(`Play request for state interrupted or not allowed:`, error);
              } else {
                  console.error(`Error attempting to play video at ${speed}x:`, error);
              }
              // Clear the ref on error as well
              if (currentPlayPromiseRef.current === playPromise) {
                  currentPlayPromiseRef.current = null;
              }
              // If this error happened during a transition, ensure transition state is reset
              if (isPlayingTransition) {
                  setIsPlayingTransition(false);
              }
          });
          // Don't await here directly in the main try block to allow cleanup to run if needed
          // The actual handling happens in the .then/.catch above
        } else {
          console.warn("Play promise was undefined for video");
        }
      } catch (error) {
        // This catch handles synchronous errors *before* play() is even called or other issues
        console.error(`Unexpected error in playVideoAtSpeed:`, error);
        if (isPlayingTransition) {
          setIsPlayingTransition(false);
        }
      }
    };

    const pauseVideo = (video: HTMLVideoElement) => {
      if (video) {
        video.loop = false;
        if (!video.paused) {
          video.pause();
        }
      }
    };

    if (isPlayingTransition) {
      const conceptualVideo = videoRefs.current[conceptualState];
      if (conceptualVideo) {
        Object.entries(videoRefs.current).forEach(([state, video]) => {
          if (video && state !== conceptualState) {
            pauseVideo(video);
          }
        });
        console.log(`Playing transition video at 5x speed for conceptual state: ${conceptualState}`);
        playVideoAtSpeed(conceptualVideo, 5, false);

        const handleTransitionEnd = () => {
          console.log(`Transition video finished or played briefly. Setting state to: ${conceptualState}`);
          setCurrentVideoState(conceptualState);
          setIsPlayingTransition(false);

          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
          }

          if (conceptualState === 'listening') {
            idleTimeoutRef.current = setTimeout(() => {
              console.log("Listening timeout (10s) reached. Switching to idle.");
              setCurrentVideoState('idle');
            }, 10000);
          }
        };

        transitionTimeoutRef.current = setTimeout(handleTransitionEnd, 500);
      }
    } else {
      const currentStateVideo = videoRefs.current[currentVideoState];
      if (currentStateVideo) {
        Object.entries(videoRefs.current).forEach(([state, video]) => {
          if (video && state !== currentVideoState) {
            pauseVideo(video);
          }
        });
        console.log(`Playing video normally (1x, looped) for current state: ${currentVideoState}`);
        playVideoAtSpeed(currentStateVideo, 1, true);

        if (currentVideoState === 'listening') {
          if (idleTimeoutRef.current) {
            clearTimeout(idleTimeoutRef.current);
          }
          idleTimeoutRef.current = setTimeout(() => {
            console.log("Listening timeout (10s) reached. Switching to idle.");
            setCurrentVideoState('idle');
          }, 10000);
        }
      }
    }

    // Cleanup function: Pause all videos and clear timeouts
    return () => {
      console.log("Running cleanup effect for video playback.");
      // Clear timeouts
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }

      // Pause all videos and reset loop
      Object.values(videoRefs.current).forEach(video => {
        if (video) {
          video.loop = false;
          if (!video.paused) {
            video.pause(); // This might trigger the AbortError in the play promise if it's pending
          }
        }
      });

      // Clear the current play promise ref on cleanup to prevent setting state on unmounted component
      // or handling an old promise. The playVideoAtSpeed catch block handles the error itself.
      if (currentPlayPromiseRef.current) {
          // We don't await this potential promise rejection here, just clear the ref.
          // The rejection is handled in the .catch block of the promise itself.
          currentPlayPromiseRef.current = null;
      }
    };
  }, [currentVideoState, isPlayingTransition, conceptualState]); // Depend on state changes

  const assignVideoRef = (state: AgentState) => (element: HTMLVideoElement | null) => {
    videoRefs.current[state] = element;
  };

  // Define CSS styles for visibility and sizing, including outline removal
 const hiddenStyle: CSSProperties = { display: 'none' };
  const visibleStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'contain', // Maintains aspect ratio, might cause letterboxing/pillarboxing
    outline: 'none',      // Removed default browser outline
    border: 'none',       // Removed default border
    // Crop a small amount (e.g., 2-3 pixels) from the bottom to hide the line
    // The inset values are top, right, bottom, left
    clipPath: 'inset(0 0 2px 0)', // Crops 2px from the bottom edge
    // Alternative clipPath values to try if 2px isn't enough or is too much:
    // clipPath: 'inset(0 0 3px 0)', // Crops 3px from the bottom edge
    // clipPath: 'inset(0 0 1px 0)', // Crops 1px from the bottom edge
  };

  return (
    <div className="relative w-[500px] h-auto overflow-hidden">
      {(Object.keys(VIDEO_SOURCES) as AgentState[]).map((state) => (
        <video
          key={state}
          ref={assignVideoRef(state)}
          autoPlay={false}
          muted
          playsInline
          preload="auto"
          style={
            (state === currentVideoState && !isPlayingTransition) ||
            (state === conceptualState && isPlayingTransition)
              ? visibleStyle // Apply the style with clip-path
              : hiddenStyle
          }
        />
      ))}
    </div>
  );
};

export default CharacterVideo;