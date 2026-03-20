import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
  const [isScannerReady, setIsScannerReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scannerRef.current.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          // Optional: Stop scanner after success
          // scannerRef.current?.clear();
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );
      setIsScannerReady(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] bg-black shadow-2xl">
      <div id="qr-reader" className="w-full"></div>
      {!isScannerReady && (
        <div className="h-64 flex items-center justify-center text-white/50 bg-black font-bold">
          카메라 초기화 중...
        </div>
      )}
    </div>
  );
};
