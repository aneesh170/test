
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, XMarkIcon } from './icons';

interface CameraProps {
  onCapture: (image: string) => void;
  onCancel: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    let isCancelled = false;

    const enableStream = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

      } catch (err) {
        if (isCancelled) return;
        
        console.error("Error accessing camera: ", err);
        let message = "Could not access the camera. Please check permissions and try again.";
        if (err instanceof Error) {
            switch(err.name) {
                case 'NotAllowedError':
                    message = "Camera access was denied. Please grant permission in your browser settings.";
                    break;
                case 'NotFoundError':
                    message = "No camera found on this device. You can upload a photo instead.";
                    break;
                case 'NotReadableError':
                    message = "The camera failed to start. It may be in use by another application or there was a hardware error. Please close other apps and try again.";
                    break;
                case 'OverconstrainedError':
                     message = "Your device's camera does not support the required settings.";
                     break;
                case 'AbortError':
                     message = "The camera failed to start in time. This may be a temporary issue. Please try again.";
                     break;
                default:
                    if (err.message.includes('Timeout')) {
                         message = "The camera failed to start in time. This may be a temporary issue. Please try again.";
                    }
                    break;
            }
        }
        setError(message);
      }
    };

    enableStream();

    return () => {
      isCancelled = true;
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video && video.srcObject) {
      const context = canvas.getContext('2d');
      if(context){
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="absolute top-4 right-4">
        <button
          onClick={onCancel}
          className="bg-black bg-opacity-50 text-gray-300 rounded-full p-3 hover:bg-opacity-75 transition-opacity"
          aria-label="Close camera"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="relative w-full max-w-3xl aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        {error ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 p-4 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Camera Error</h2>
            <p>{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8">
        <button
          onClick={handleCapture}
          disabled={!!error}
          className="group flex items-center justify-center w-20 h-20 bg-white rounded-full border-4 border-white ring-4 ring-gray-500 ring-opacity-50 hover:ring-opacity-100 transition-all duration-200 disabled:bg-gray-400 disabled:ring-gray-600"
          aria-label="Take picture"
        >
            <CameraIcon className="w-10 h-10 text-gray-800" />
        </button>
      </div>
    </div>
  );
};
