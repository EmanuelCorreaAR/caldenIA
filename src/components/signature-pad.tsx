"use client";

import { useEffect, useRef, useState } from "react";

type SignaturePadProps = {
  name: string;
  label: string;
  required?: boolean;
};

export function SignaturePad({ name, label, required }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setup = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const ratio = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = 180;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0a120c";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      inked.current = false;
      setDataUrl("");
    };

    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    inked.current = true;
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    const canvas = canvasRef.current;
    if (!canvas || !inked.current) {
      setDataUrl("");
      return;
    }
    setDataUrl(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    inked.current = false;
    setDataUrl("");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-ink">
          {label}
          {required ? " *" : ""}
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-muted transition hover:text-accent"
        >
          Borrar
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-accent/40 bg-white">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
      </div>
      <p className="text-xs text-muted">Firmá con el dedo en el recuadro.</p>
      <input
        type="text"
        name={name}
        value={dataUrl}
        required={required}
        readOnly
        tabIndex={-1}
        aria-label={label}
        className="sr-only"
        onChange={() => undefined}
      />
    </div>
  );
}
