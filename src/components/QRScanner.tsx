import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCcw } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

// Web Audio API를 사용하여 큐알 인식 시 "삐" 소리를 재생하는 헬퍼 함수
const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    // 880Hz: 맑고 높은 "삐" 소리 주파수
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    // 볼륨 설정
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

    oscillator.start();

    // 0.12초 뒤에 서서히 볼륨을 줄이면서 정지 (뚝 끊기는 팝 노이즈 방지)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    oscillator.stop(audioCtx.currentTime + 0.12);
  } catch (error) {
    console.error('Audio beep failed:', error);
  }
};

export const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
  const [cameras, setCameras] = useState<{ id: string, label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScannerReady, setIsScannerReady] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const isScanningRef = useRef(false);

  const startScanner = async (cameraConfig: string | { facingMode: string }) => {
    if (!html5QrCodeRef.current) return;
    
    try {
      if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
      
      isScanningRef.current = true;
      
      await html5QrCodeRef.current.start(
        cameraConfig,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!isScanningRef.current) return;
          isScanningRef.current = false;
          playBeep(); // 큐알 인식 성공 즉시 삐 소리 재생
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
        const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('후면')) || devices[devices.length - 1];
        setSelectedCameraId(backCamera.id);
        startScanner({ facingMode: "environment" });
      } else {
        startScanner({ facingMode: "environment" });
      }
    }).catch(err => {
      console.error("Error getting cameras", err);
      startScanner({ facingMode: "environment" });
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
