"use client";
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/livekit/button';

function WelcomeImage() {
  const [eyeRotations, setEyeRotations] = useState<number[]>([0, 0]);
  const eyeRefs = useRef<(HTMLImageElement | null)[]>(Array(2).fill(null));
  const containerRef = useRef<HTMLDivElement>(null);
  const totalRotationsRef = useRef<number[]>([0, 0]);
  const lastAnglesRef = useRef<number[]>([0, 0]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const newRotations = eyeRefs.current.map((eye, index) => {
        if (!eye) return 0;

        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;

        const deltaX = event.clientX - eyeCenterX;
        const deltaY = event.clientY - eyeCenterY;

        // Calculate the current angle using atan2 (returns -180 to 180)
        const currentAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

        // Get the last recorded angle
        const lastAngle = lastAnglesRef.current[index];

        // Calculate the difference between current and last angle
        let angleDiff = currentAngle - lastAngle;

        // Handle the wrap-around case for smooth rotation
        // If the difference is greater than 180, it means we wrapped around clockwise
        if (angleDiff > 180) {
          angleDiff -= 360;
        }
        // If the difference is less than -180, it means we wrapped around counter-clockwise
        else if (angleDiff < -180) {
          angleDiff += 360;
        }

        // Add the difference to our total rotation
        totalRotationsRef.current[index] += angleDiff;

        // Store the current angle for the next frame
        lastAnglesRef.current[index] = currentAngle;

        return totalRotationsRef.current[index];
      });

      setEyeRotations(newRotations);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Luffy Head Image */}
      <Image
        src="/filuffyhead.png"
        alt="Welcome"
        width={300}
        height={300}
        className="w-full h-auto max-w-[300px]"
      />

      {/* Eyes positioned relative to the image */}
      <div className="absolute inset-0">
        {/* Left Eye */}
        <img
          ref={(el) => { eyeRefs.current[0] = el; }}
          src="/eye.png"
          alt="eye"
          className="absolute top-[68%] left-[47%] w-[23px] h-[23px] transition-transform duration-100 ease-out transform -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(-50%, -50%) rotate(${eyeRotations[0]}deg)` }}
        />

        {/* Right Eye */}
        <img
          ref={(el) => { eyeRefs.current[1] = el; }}
          src="/eye.png"
          alt="eye"
          className="absolute top-[67%] right-[45%] w-[23px] h-[23px] transition-transform duration-100 ease-out transform translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(50%, -50%) rotate(${eyeRotations[1]}deg)` }}
        />
      </div>
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref}>
      <section className="bg-background flex flex-col items-center justify-center text-center p-4">
        <div className="w-full max-w-md mx-auto">
          <WelcomeImage />
        </div>

        <p className="text-foreground max-w-prose pt-4 leading-6 font-medium">
          Meet your Sdc Joint Ai — chat now!
        </p>

        <Button variant="primary" size="lg" onClick={onStartCall} className="mt-6 w-64 font-mono">
          {startButtonText}
        </Button>
      </section>
    </div>
  );
};