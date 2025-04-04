import React from 'react';
export const prerender = false;

interface LiveVideoProps {
  width?: string | number;
  height?: string | number;
  src: string;
}

const LiveVideo: React.FC<LiveVideoProps> = ({ 
  width = 640, 
  height = 360, 
  src 
}) => {
  return (
    <div className="live-video-container">
      <iframe 
        allow="encrypted-media" 
        width={width} 
        height={height} 
        scrolling="no" 
        frameBorder="0" 
        allowFullScreen 
        src={src}
      />
    </div>
  );
};

export default LiveVideo;