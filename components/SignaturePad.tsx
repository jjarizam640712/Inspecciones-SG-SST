import React, { useRef, useEffect, useState } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface SignaturePadProps {
  onChange: (base64: string | null) => void;
  initialValue: string | null;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Función para rellenar el fondo de blanco (Crucial para exportar a JPEG correctamente)
  const fillBackground = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 200;
        
        // Limpiamos y preparamos el fondo blanco
        const ctx = canvas.getContext('2d');
        if (ctx) {
             ctx.fillStyle = '#ffffff';
             ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        if (initialValue) {
            const img = new Image();
            img.onload = () => {
                ctx?.drawImage(img, 0, 0);
            };
            img.src = initialValue;
            setHasSignature(true);
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      save();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Limpiar y volver a pintar de blanco
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    setHasSignature(false);
    onChange(null);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Nos aseguramos que el fondo sea blanco antes de exportar
      fillBackground(canvas);
      // Exportamos como JPEG calidad media (Super ligero)
      onChange(canvas.toDataURL('image/jpeg', 0.5));
    }
  };

  return (
    <div className="w-full border-2 border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
          <PenTool size={16} />
          <span>Firme aquí</span>
        </div>
        <button 
          type="button"
          onClick={clear}
          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 font-medium px-2 py-1 hover:bg-red-50 rounded"
        >
          <Eraser size={14} />
          Limpiar
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full touch-none cursor-crosshair bg-white"
        style={{ height: '200px' }}
      />
      {!hasSignature && (
        <div className="text-center text-xs text-slate-400 pb-2 pointer-events-none select-none">
          Dibuje su firma en el recuadro
        </div>
      )}
    </div>
  );
};

export default SignaturePad;