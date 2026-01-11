import React from 'react';
import { X, Server, Cloud, Cpu, ArrowRight, ArrowDown } from 'lucide-react';

const ArchitectureModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white border-[4px] border-black p-6 rounded-[32px] max-w-2xl w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-in zoom-in duration-300">

                {/* 상단 헤더 */}
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                    <div className="flex items-center gap-2">
                        <Cloud className="text-blue-500" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter">System Infrastructure</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent active:border-black"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* 메인 아키텍처 바디 */}
                <div className="relative space-y-6">

                    {/* GCP & GCE 레이어 */}
                    <div className="border-4 border-dashed border-gray-300 rounded-[24px] p-6 relative bg-gray-50/50">
                        <div className="absolute -top-3 left-6 bg-white px-3 py-0.5 border-2 border-gray-300 rounded-full font-black text-gray-400 text-[10px] uppercase tracking-widest">
                            Google Cloud Platform (GCE Instance)
                        </div>

                        {/* K3s 클러스터 영역 */}
                        <div className="border-4 border-black rounded-[20px] p-6 bg-white relative shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                            <div className="absolute -top-3 left-4 bg-yellow-400 border-2 border-black text-black px-2 py-0.5 text-[10px] font-black rounded uppercase">
                                K3s Lightweight Kubernetes
                            </div>

                            {/* 서비스 흐름도 */}
                            <div className="flex flex-col gap-6">

                                {/* 상단: 프론트 & 게이트웨이 */}
                                <div className="grid grid-cols-7 items-center">
                                    {/* Next.js */}
                                    <div className="col-span-3 bg-blue-50 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                                        <div className="text-[9px] font-black text-blue-600 uppercase mb-1">Frontend Pod</div>
                                        <div className="font-black text-sm">Next.js</div>
                                        <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center justify-center gap-1">
                                            <Server size={10} /> Nginx Proxy
                                        </div>
                                    </div>

                                    {/* 연결 화살표 */}
                                    <div className="col-span-1 flex justify-center text-black">
                                        <ArrowRight size={20} strokeWidth={3} />
                                    </div>

                                    {/* Go Fiber */}
                                    <div className="col-span-3 bg-orange-50 border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
                                        <div className="text-[9px] font-black text-orange-600 uppercase mb-1">Gateway Pod</div>
                                        <div className="font-black text-sm">Go Fiber</div>
                                        <div className="text-[10px] font-bold text-gray-500 mt-1 flex items-center justify-center gap-1">
                                            <Cpu size={10} /> API Handler
                                        </div>
                                    </div>
                                </div>

                                {/* 수직 화살표 */}
                                <div className="flex justify-center -my-2">
                                    <ArrowDown size={20} className="text-black" strokeWidth={3} />
                                </div>

                                {/* 하단: Spring Boot */}
                                <div className="flex justify-center">
                                    <div className="w-4/5 bg-green-50 border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
                                        <div className="text-[9px] font-black text-green-600 uppercase mb-1">AI Logic Pod</div>
                                        <div className="font-black text-md">Spring Boot Framework</div>
                                        <div className="text-[10px] font-bold text-gray-500 mt-1">
                                            Embedded Apache Tomcat 10
                                        </div>
                                        {/* 장식용 배경 아이콘 */}
                                        <div className="absolute -right-2 -bottom-2 opacity-10">
                                            <Server size={60} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 외부 연동: Gemini AI */}
                    <div className="flex justify-center items-center gap-3 pt-2">
                        <div className="h-[2px] flex-1 bg-dashed border-t-2 border-gray-300 border-dashed"></div>
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 border-2 border-black px-6 py-2 rounded-2xl font-black text-white text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                            GOOGLE GEMINI AI API (LLM)
                        </div>
                        <div className="h-[2px] flex-1 bg-dashed border-t-2 border-gray-300 border-dashed"></div>
                    </div>
                </div>

                {/* 푸터 설명 */}
                <div className="mt-8 text-center">
                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed max-w-sm mx-auto">
                        "The gates to my tech stack have swung open."<br/>
                        Everything is containerized and orchestrated by K3s on GCP.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArchitectureModal;
