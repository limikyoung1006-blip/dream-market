import { QRCodeSVG } from 'qrcode.react';

interface QRGeneratorProps {
  value: string;
  size?: number;
  label?: string;
}

export const QRGenerator = ({ value, size = 200, label }: QRGeneratorProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-inner border border-slate-100">
      <div className="p-4 bg-white rounded-2xl border-4 border-primary-50">
        <QRCodeSVG 
          value={value} 
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
      {label && <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );
};
