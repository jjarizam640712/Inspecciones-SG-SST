
import React, { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  photo1: string | null;
  photo2: string | null;
  onChange1: (value: string | null) => void;
  onChange2: (value: string | null) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photo1, photo2, onChange1, onChange2 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1024;
        let width = img.width;
        let height = img.height;
        if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        if (!photo1) onChange1(base64); else onChange2(base64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-xl font-bold text-xs"><Camera size={18}/> CÁMARA</button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center bg-white border border-blue-200 text-blue-600 p-3 rounded-xl"><Upload size={18}/></button>
      </div>
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <div className="grid grid-cols-2 gap-3">
        {photo1 && <div className="relative aspect-square"><img src={photo1} className="w-full h-full object-cover rounded-xl" /><button onClick={() => onChange1(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button></div>}
        {photo2 && <div className="relative aspect-square"><img src={photo2} className="w-full h-full object-cover rounded-xl" /><button onClick={() => onChange2(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button></div>}
      </div>
    </div>
  );
};

export default PhotoUpload;
