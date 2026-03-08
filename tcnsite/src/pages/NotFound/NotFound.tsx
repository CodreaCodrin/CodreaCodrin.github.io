import { Link } from '@tanstack/react-router';
import './NotFound.css';

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:8000";

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
                            data-text="404"
                        >
                            404
                       </h1>
                   </div>
                </div>

                {/* Subtext */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] relative inline-block">
                        Page Not Found
                        <span className="absolute -inset-1 bg-white/10 -skew-y-3 -z-10 block"></span>
                    </p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-4 px-4">
                        We're sorry, the page you requested could not be found. Please go back to the homepage.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col gap-4">
                     <Link 
                        to="/" 
                        className="group relative px-8 py-3 bg-white text-black font-bold uppercase tracking-wider transition-all hover:bg-gray-200"
                    >
                        <span className="relative z-10 group-hover:text-purple-600 transition-colors">Go Home</span>
                        <div className="absolute inset-0 h-full w-full bg-white transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform border border-white opacity-30"></div>
                    </Link>

                    <button 
                        onClick={() => {
                            fetch(BASE_URL + "/")
                            .then(res => res.json())
                            .then(data => alert(JSON.stringify(data)))
                            .catch(err => alert("Error: " + err));
                        }}
                        className="group relative px-8 py-3 bg-white text-black font-bold uppercase tracking-wider transition-all hover:bg-gray-200"
                    >
                        <span className="relative z-10 group-hover:text-purple-600 transition-colors">Test</span>
                        <div className="absolute inset-0 h-full w-full bg-white transform translate-x-2 translate-y-2 -z-10 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform border border-white opacity-30"></div>
                    </button>
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