import ReturnHome from '../../components/navigation/ReturnHome';
import copy from '../../../data/site.json';
import './NotFound.css';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0a0a0a] text-white font-mono overflow-hidden relative">
            {/* Scanlines overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-70"></div>

            <div className="relative z-20 flex flex-col items-center">
                {/* Glitch Circle and 404 */}
                <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
                   {/* Spinning Glitch Rings */}
                   <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 transform scale-90"></div>
                   <div className="absolute inset-0 rounded-full border-2 border-white glitch-ring"></div>
                   
                   {/* 404 Text */}
                   <div className="relative z-30">
                       <h1 
                            className="text-8xl md:text-9xl font-black tracking-tighter glitch-text text-white"
                            data-text={copy.notFound.code}
                        >
                            {copy.notFound.code}
                       </h1>
                   </div>
                </div>

                {/* Subtext */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] relative inline-block">
                        {copy.notFound.title}
                        <span className="absolute -inset-1 bg-white/10 -skew-y-3 -z-10 block"></span>
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-4 px-4">
                        {copy.notFound.description}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col gap-4">
                     <ReturnHome />
                </div>
            </div>

            {/* Decorative glitched squares */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-8 h-2 bg-white/10 animate-bounce"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-8 bg-white/5"></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full"></div>
            
        </div>
    );
}
