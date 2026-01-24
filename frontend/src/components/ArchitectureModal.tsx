"use client";

import React from 'react';
import { X, Server, Cloud, Cpu, ArrowRight, ArrowDown, Database, Link as LinkIcon, Gift } from 'lucide-react';

const ArchitectureModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border-[4px] border-black p-6 rounded-[32px] max-w-2xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in zoom-in duration-300">

                {/* 상단 헤더 */}
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                    <div className="flex items-center gap-2">
                        <Cloud className="text-blue-500" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Tech Stack & Reward Flow</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent active:border-black"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 메인 아키텍처 바디 */}
                <div className="relative space-y-4">

                    {/* GCP & K3s 레이어 */}
                    <div className="border-4 border-dashed border-gray-300 rounded-[24px] p-5 relative bg-gray-50/50">
                        <div className="absolute -top-3 left-6 bg-white px-3 py-0.5 border-2 border-gray-300 rounded-full font-black text-gray-400 text-[10px] uppercase tracking-widest">
                            Cloud: Google Cloud Platform (GCE)
                        </div>

                        {/* K3s 클러스터 영역 */}
                        <div className="border-4 border-black rounded-[20px] p-5 bg-white relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                            <div className="absolute -top-3 left-4 bg-yellow-400 border-2 border-black text-black px-2 py-0.5 text-[10px] font-black rounded uppercase">
                                Orchestration: K3s
                            </div>

                            {/* 서비스 흐름도 */}
                            <div className="flex flex-col gap-4">
                                {/* Next.js & Go Fiber */}
                                <div className="grid grid-cols-7 items-center">
                                    <div className="col-span-3 bg-blue-50 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                                        <div className="text-[9px] font-black text-blue-600 uppercase">Frontend</div>
                                        <div className="font-black text-xs">Next.js</div>
                                    </div>
                                    <div className="col-span-1 flex justify-center"><ArrowRight size={16} /></div>
                                    <div className="col-span-3 bg-orange-50 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                                        <div className="text-[9px] font-black text-orange-600 uppercase">Gateway</div>
                                        <div className="font-black text-xs">Go Fiber</div>
                                    </div>
                                </div>

                                <div className="flex justify-center -my-1"><ArrowDown size={16} /></div>

                                {/* Spring Boot */}
                                <div className="bg-green-50 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                                    <div className="text-[9px] font-black text-green-600 uppercase">Analysis Engine</div>
                                    <div className="font-black text-sm">Spring Boot (AI Logic)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 수직 연결 화살표 (Blockchain 전송 흐름) */}
                    <div className="flex justify-center py-1">
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] font-black text-blue-600 uppercase mb-1">If Score ≥ 95%</div>
                            <ArrowDown size={20} className="text-blue-600 animate-bounce" strokeWidth={3} />
                        </div>
                    </div>

                    {/* 블록체인 레이어 (Ethereum) */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Infura / RPC */}
                        <div className="border-2 border-black p-3 rounded-2xl bg-slate-100 flex items-center justify-center gap-2">
                            <Database size={16} className="text-orange-500" />
                            <div className="text-center">
                                <div className="text-[8px] font-black text-gray-500 uppercase">Node Provider</div>
                                <div className="text-[11px] font-black italic">Infura (RPC)</div>
                            </div>
                        </div>

                        {/* Ethereum Sepolia */}
                        <div className="border-2 border-black p-3 rounded-2xl bg-indigo-600 text-white flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <LinkIcon size={16} />
                            <div className="text-center">
                                <div className="text-[8px] font-black text-indigo-200 uppercase">Network</div>
                                <div className="text-[11px] font-black">Ethereum Sepolia</div>
                            </div>
                        </div>
                    </div>

                    {/* 최종 보상: VC Token */}
                    <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 border-4 border-black p-4 rounded-[24px] flex items-center justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400 p-2 border-2 border-black rounded-lg">
                                <Gift size={20} className="text-black" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-yellow-700 uppercase">Reward Asset</div>
                                <div className="text-lg font-black tracking-tighter">ValueChain (VC) Token</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-gray-500 uppercase">Amount</div>
                            <div className="text-sm font-black text-blue-600">1 ~ 1,000 Random</div>
                        </div>
                    </div>
                </div>

                {/* 푸터 설명 */}
                <div className="mt-6 text-center border-t-2 border-gray-100 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 leading-tight">
                        "Your creativity is rewarded on-chain."<br/>
                        Analyzed by Gemini Pro, Orchestrated by K3s, Rewarded on Ethereum.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureModal;
