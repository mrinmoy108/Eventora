"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  text: string;
  size?: number;
  className?: string;
}

export default function QRCodeImage({ text, size = 150, className = "" }: QRCodeImageProps) {
  const [qrSrc, setQrSrc] = useState<string>("");

  useEffect(() => {
    if (!text) return;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    })
      .then(url => {
        setQrSrc(url);
      })
      .catch(err => {
        console.error("Failed to generate QR Code", err);
      });
  }, [text, size]);

  if (!qrSrc) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className={`bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-gray-400 ${className}`}
      >
        Generating...
      </div>
    );
  }

  return (
    <img 
      src={qrSrc} 
      alt="QR Code" 
      width={size} 
      height={size} 
      className={`object-contain ${className}`}
    />
  );
}
