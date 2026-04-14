import React from "react";

const VideoPlayer = ({ videoUrl, title }) => {
  if (!videoUrl) {
    return (
      <div className="text-white text-center flex flex-col items-center">
        <span className="text-gray-400 mb-2 material-symbols-outlined text-5xl">
          videocam_off
        </span>
        <p>현재 준비 중인 영상입니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {videoUrl.includes("cloudflarestream.com") ? (
        <iframe
          src={`${videoUrl.replace("/watch", "/iframe")}?autoplay=1`}
          className="w-full h-full"
          allowFullScreen
          title={title}
        ></iframe>
      ) : (
        <video
          src={videoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

export default VideoPlayer;
