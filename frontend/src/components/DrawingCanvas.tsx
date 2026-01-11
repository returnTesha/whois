"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Loader2, Send, RotateCcw, Github } from 'lucide-react';
import ArchitectureModal from "@/components/ArchitectureModal";

interface AnalysisResult {
    similarity: number;
    feedback: string;
    feedback_ko: string;
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
        if (!canvas) {
            console.error("Canvas ref is null");
            return;
        }

        setStatus('loading');

        try {
            // 1. 임시 캔버스 생성 및 크기 설정
            // 원본 캔버스의 '실제 내부 해상도(width/height)'를 그대로 가져와야 합니다.
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            if (!tempCtx) {
                throw new Error("Could not get context from temp canvas");
            }

            // 2. 배경을 먼저 흰색으로 채우기 (투명도 방지)
            tempCtx.fillStyle = '#FFFFFF';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            // 3. 원본 캔버스 내용을 임시 캔버스에 복사
            tempCtx.drawImage(canvas, 0, 0);

            // 4. 데이터 추출 및 길이 확인
            const imageData = tempCanvas.toDataURL('image/png');

            if (imageData.length < 100) { // 너무 짧으면 실패한 것
                throw new Error("Generated image data is too short or empty");
            }

            //5. 서버 전송 (서버의 @RequestBody Map 키값이 'image'인지 확인!)
            const response = await fetch('/api/go/v1/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ image_data: imageData }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            setResult(data);
            setStatus('result');

        } catch (error) {
            console.error("Analysis process failed:", error);
            setStatus('idle');
            alert("분석에 실패했습니다. 이미지가 정상적으로 생성되지 않았습니다.");
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-xl mx-auto p-4 select-none min-h-screen justify-center">
            {/* 헤더 섹션: 중복 제거 및 깔끔하게 정리 */}
            {/*<div className="text-center mb-8">*/}
                {/*<h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase mb-2">Draw a question mark</h1>*/}
                {/*<p className="text-base font-bold text-gray-500">*/}
                {/*    Draw a <span className="text-blue-600 underline">?</span> to enter my world*/}
                {/*</p>*/}
            {/*</div>*/}

            {/* 메인 영역 */}
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

                {/* 로딩 화면 */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center justify-center bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px]"
                         style={{ width: canvasSize, height: canvasSize }}>

                        {/* 뱅글뱅글 돌아가는 로더 */}
                        <div className="relative mb-8">
                            <div className="w-20 h-20 border-[10px] border-gray-100 rounded-full"></div>
                            <div className="absolute top-0 left-0 w-20 h-20 border-[10px] border-blue-600 border-t-transparent rounded-full custom-spinner"></div>
                        </div>

                        <div className="flex flex-col items-center">
                            <p className="font-black text-3xl text-gray-900 flex items-center tracking-tight">
                                ANALYZING
                                <span className="flex ml-2 space-x-1">
                    <span className="dot-animation" style={{ animationDelay: '0s' }}>.</span>
                    <span className="dot-animation" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="dot-animation" style={{ animationDelay: '0.4s' }}>.</span>
                </span>
                            </p>
                            {/* 요청하신 파란색 문구 */}
                            <p className="text-sm font-bold text-blue-600 mt-2 uppercase tracking-[0.2em] animate-pulse">
                                Please wait a 10s
                            </p>
                        </div>
                    </div>
                )}

                {/* 결과 화면 */}
                {status === 'result' && result && (
                    <div className="w-full flex flex-col items-center animate-in zoom-in duration-300 max-w-[400px]">
                        <div className="border-4 border-black p-8 bg-white text-center w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px] mb-6">
                            <div className="text-8xl font-black text-red-500 mb-4">
                                {result.similarity}%
                            </div>

                            {/* 해설 텍스트 및 언어 전환 */}
                            <div className="relative p-4 bg-green-50 border-4 border-green-500 rounded-xl font-bold text-green-700 italic text-lg shadow-[4px_4px_0px_0px_rgba(0,150,0,0.1)]">
                                "{showKo ? result.feedback_ko : result.feedback}"

                                <button
                                    onClick={() => setShowKo(!showKo)}
                                    className="mt-3 block mx-auto text-xs bg-green-500 text-white px-2 py-1 rounded-md not-italic hover:bg-green-600 transition-colors"
                                >
                                    {showKo ? "View English" : "한국어로 보기"}
                                </button>
                            </div>
                        </div>
                        {/* 깃허브 버튼 (추가) */}
                        <a
                            href="https://github.com/returnTesha/whois"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full p-4 bg-gray-900 text-white rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all hover:bg-black"
                        >
                            <Github size={20} /> View Source Code on GitHub
                        </a>

                        {/* 아키텍처 보기 버튼 (텔레그램 버튼 위) */}
                        <button
                            onClick={() => setShowArch(true)}
                            className="w-full mb-4 py-3 bg-purple-500 text-white border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all"
                        >
                            🔍 View Infrastructure Architecture
                        </button>

                        {/* 하단 버튼 섹션 */}
                        <div className="w-full space-y-4">
                            <button onClick={() => setStatus('idle')} className="w-full py-4 bg-gray-900 text-white border-2 border-black rounded-xl font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
                                Try Again
                            </button>
                            <a href="https://t.me/returnTesha" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full p-4 bg-sky-400 text-white rounded-xl font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all">
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
