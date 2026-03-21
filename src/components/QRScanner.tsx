import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCcw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScannerReady, setIsScannerReady] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async (cameraId: string) => {
    if (!html5QrCodeRef.current) return;
    
    try {
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      await html5QrCodeRef.current.start(
        cameraId,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (onScanFailure) onScanFailure(errorMessage);
        }
      );
      setIsScannerReady(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
    }
  };

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = scanner;

    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length > 0) {
        setCameras(devices.map(d => ({ id: d.id, label: d.label })));
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
        setSelectedCameraId(backCamera.id);
        startScanner(backCamera.id);
      }
    }).catch(err => {
      console.error("Error getting cameras", err);
    });

    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error(err));
      }
    };
  }, []);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] bg-black shadow-2xl flex flex-col">
      <div id="qr-reader" className="w-full"></div>
      
      <div className="p-4 bg-slate-900 flex flex-col gap-3">
        <div className="flex items-center justify-between text-white/70 px-2">
          <div className="flex items-center gap-2">
            <Camera size={16} />
            <span className="text-[10px] font-black uppercase tracking-wider">Camera Selection</span>
          </div>
          <button 
            onClick={() => startScanner(selectedCameraId)}
            className="p-2 hover:bg-white/10 rounded-xl transition-all"
            title="카메라 재시작"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
        
        <select 
          className="w-full bg-slate-800 text-white p-3 rounded-2xl text-xs font-bold outline-none border border-slate-700"
          value={selectedCameraId}
          onChange={(e) => {
            setSelectedCameraId(e.target.value);
            startScanner(e.target.value);
          }}
        >
          {cameras.map(camera => (
            <option key={camera.id} value={camera.id}>
              {camera.label || `Camera ${camera.id}`}
            </option>
          ))}
        </select>
        
        {!isScannerReady && (
          <div className="text-center text-white/50 text-[10px] font-bold animate-pulse">
            카메라 연결 중...
          </div>
        )}
      </div>
    </div>
  );
};
