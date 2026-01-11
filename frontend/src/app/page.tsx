import DrawingCanvas from "@/components/DrawingCanvas";
import { RoughNotation } from "react-rough-notation";

export default function Home() {
  return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-12">

          <header className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight">
              Draw a question mark
            </h1>
            {/*<p className="text-2xl text-gray-500 font-medium">*/}
            {/*  Curiosity is the key to discovery.*/}
            {/*</p>*/}
          </header>

          <section className="space-y-8">
            <div className="relative inline-block w-full">
              <div className="mb-6">
                <p className="text-2xl">
                  Please draw a <span className="font-bold text-red-500 underline decoration-wavy decoration-2 underline-offset-4">Question Mark (?)</span>
                </p>
                <p className="text-sm text-gray-400 mt-2 italic">
                  (to verify you are curious enough to explore my world)
                </p>
              </div>

              {/* 그림판 컴포넌트 */}
              <div className="flex justify-center">
                <DrawingCanvas />
              </div>
            </div>
          </section>

          {/*<footer className="space-y-2">*/}
          {/*  <p className="text-gray-400">*/}
          {/*    Once the AI validates your curiosity,*/}
          {/*  </p>*/}
          {/*  <p className="text-md font-semibold text-gray-500">*/}
          {/*    The gates to my tech stack will swing open.*/}
          {/*  </p>*/}
          {/*</footer>*/}
        </div>
      </main>
  );
}
