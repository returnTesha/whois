"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
// Gift, ExternalLink 아이콘을 추가했습니다.
import { Loader2, Send, RotateCcw, Github, Gift, ExternalLink } from 'lucide-react';
import ArchitectureModal from "@/components/ArchitectureModal";

interface AnalysisResult {
    similarity: number;
    feedback: string;
    feedback_ko: string;
    tx_id: string;
}

export default function DrawingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'result'>('idle');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [canvasSize, setCanvasSize] = useState(320);
    const [showKo, setShowKo] = useState(false);
    const [showArch, setShowArch] = useState(false);

    useEffect(() => {
        const updateSize = () => {
            const size = Math.min(window.innerWidth - 40, 400);
            setCanvasSize(size);
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const getCoordinates = useCallback((e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY;
        }
        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const startDrawing = useCallback((e: MouseEvent | TouchEvent) => {
        isDrawingRef.current = true;
        const pos = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        if (e.cancelable && e.type === 'touchstart') e.preventDefault();
    }, [getCoordinates]);

    const draw = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDrawingRef.current) return;
        const pos = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        if (e.cancelable && e.type === 'touchmove') e.preventDefault();
    }, [getCoordinates]);

    const stopDrawing = useCallback(() => { isDrawingRef.current = false; }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || status !== 'idle') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;

        canvas.addEventListener('mousedown', startDrawing);
        window.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        window.addEventListener('touchmove', draw, { passive: false });
        window.addEventListener('touchend', stopDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            window.removeEventListener('mousemove', draw);
            window.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('touchstart', startDrawing);
            window.removeEventListener('touchmove', draw);
            window.removeEventListener('touchend', stopDrawing);
        };
    }, [status, startDrawing, draw, stopDrawing, canvasSize]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const exportImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setStatus('loading');

        try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) throw new Error("Context error");

            tempCtx.fillStyle = '#FFFFFF';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);

            const imageData = tempCanvas.toDataURL('image/png');

            const response = await fetch('http://localhost:4000/api/go/v1/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData }),
            });

            const data = await response.json();
            setResult(data);
            setStatus('result');
        } catch (error) {
            console.error(error);
            setStatus('idle');
            alert("Analysis failed.");
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xl mx-auto p-4 select-none min-h-screen justify-center">
            {/* 상단 안내 문구 (영문) */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-1">Draw a question mark</h1>
                <p className="text-sm font-bold text-gray-500">
                    Score <span className="text-blue-600">95% or higher</span> to earn <span className="text-blue-600 font-extrabold">ValueChain (VC) Tokens</span>! 🎁
                </p>
            </div>

            <div className="w-full flex flex-col items-center">
                {status === 'idle' && (
                    <>
                        <div
                            className="relative bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 overflow-hidden"
                            style={{
                                width: canvasSize,
                                height: canvasSize,
                                border: '4px solid #000000',
                                borderRadius: '20px'
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                style={{ width: '100%', height: '100%', display: 'block' }}
                                className="cursor-crosshair touch-none"
                            />
                        </div>

                        <div className="flex gap-4 w-full max-w-[400px]">
                            <button onClick={clearCanvas} className="flex-1 py-4 font-bold text-gray-800 border-2 border-black rounded-xl active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center gap-2 bg-white">
                                <RotateCcw size={20} /> Reset
                            </button>
                            <button onClick={exportImage} className="flex-[1.5] py-4 font-bold text-white bg-blue-600 border-2 border-black rounded-xl active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                                Analyze!
                            </button>
                        </div>
                    </>
                )}

                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px]"
                         style={{ width: canvasSize, height: canvasSize }}>
                        <div className="relative mb-8">
                            <div className="w-20 h-20 border-[10px] border-gray-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-[10px] border-blue-600 border-t-transparent rounded-full custom-spinner"></div>
                        </div>
                        <p className="font-black text-3xl text-gray-900 tracking-tight">ANALYZING...</p>
                        <p className="text-sm font-bold text-blue-600 mt-2 uppercase animate-pulse">Please wait a 30s</p>
                    </div>
                )}

                {status === 'result' && result && (
                    <div className="w-full flex flex-col items-center animate-in zoom-in duration-300 max-w-[400px]">
                        <div className="border-4 border-black p-8 bg-white text-center w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px] mb-6">
                            <div className="text-8xl font-black text-red-500 mb-4">{result.similarity}%</div>

                            <div className="relative p-4 bg-green-50 border-4 border-green-500 rounded-xl font-bold italic mb-6">
                                "{showKo ? result.feedback_ko : result.feedback}"
                                <button onClick={() => setShowKo(!showKo)} className="mt-3 block mx-auto text-xs bg-green-500 text-white px-2 py-1 rounded-md not-italic">
                                    {showKo ? "English" : "한국어"}
                                </button>
                            </div>
                            {/* [수정] 95% 이상이고 해시가 있을 때만 보상 박스를 보여줍니다. */}
                            {result.similarity >= 95 && result.tx_id && (
                                <div className="mt-6 p-4 bg-blue-50 border-4 border-blue-600 rounded-xl text-left animate-pulse">
                                    <div className="flex items-center gap-2 mb-2 font-black text-blue-900 uppercase">
                                        <Gift className="text-blue-600" size={20} /> Reward Dispatched!
                                    </div>
                                    <a
                                        href={`https://sepolia.etherscan.io/tx/${result.tx_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 w-full p-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-bold text-[10px] hover:bg-blue-50 transition-all group"
                                    >
                                        <span className="truncate uppercase">VIEW TX: {result.tx_id}</span>
                                        <ExternalLink size={14} className="shrink-0" />
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="w-full space-y-4">
                            <a href="https://github.com/returnTesha/whois" target="_blank" className="flex items-center justify-center gap-2 w-full p-4 bg-gray-900 text-white rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                                <Github size={20}/> GitHub
                            </a>
                            <button onClick={() => setShowArch(true)} className="w-full py-3 bg-purple-500 text-white border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                                🔍 Infrastructure Architecture
                            </button>
                            <button onClick={() => setStatus('idle')} className="w-full py-4 bg-gray-900 text-white border-2 border-black rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                                Try Again
                            </button>
                            <a href="https://t.me/returnTesha" target="_blank" className="flex items-center justify-center gap-2 w-full p-4 bg-sky-400 text-white rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                                <Send size={18} /> Telegram @returnTesha
                            </a>
                        </div>
                    </div>
                )}

                {showArch && <ArchitectureModal onClose={() => setShowArch(false)} />}
            </div>
        </div>
    );
}
