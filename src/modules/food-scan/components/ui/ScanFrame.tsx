import React, { useEffect, useState } from 'react';

type ScanFrameProps = {
  image?: string;
};

export const ScanFrame: React.FC<ScanFrameProps> = ({ image }) => {
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Target: 3:4 aspect ratio
      // Max width: 80% of viewport or 400px (for desktop)
      // Max height: 65% of viewport
      const maxWidth = Math.min(viewportWidth * 0.8, 400);
      const maxHeight = viewportHeight * 0.65;

      let width = maxWidth;
      let height = (width * 4) / 3;

      // If height exceeds max height, scale down width
      if (height > maxHeight) {
        height = maxHeight;
        width = (height * 3) / 4;
      }

      setFrameSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (frameSize.width === 0) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex justify-center pt-26 overflow-hidden">
      <div
        className="relative rounded-[32px] transition-all duration-300 ease-out overflow-hidden"
        style={{
          width: frameSize.width,
          height: frameSize.height,
          // Use box-shadow to create the semi-transparent mask around the frame
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        }}
      >
        {image && (
          <img
            src={image}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Corner Indicators */}
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-white rounded-tl-[24px] z-10" />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-white rounded-tr-[24px] z-10" />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-white rounded-bl-[24px] z-10" />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-white rounded-br-[24px] z-10" />
      </div>
    </div>
  );
};
