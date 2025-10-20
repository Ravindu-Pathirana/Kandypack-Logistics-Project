import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Smooth, lightweight route-change overlay loader.
// Shows briefly on every navigation to make transitions feel deliberate.
export default function RouteLoader() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any pending hide timers to avoid flicker
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // Show immediately on route change
    setIsVisible(true);

    // Keep the loader visible for a minimum duration to avoid flashes
    // Adjust duration to taste (300-500ms works well)
    hideTimerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      hideTimerRef.current = null;
    }, 400);

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [location.pathname, location.search, location.hash]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[1000] pointer-events-none">
      {/* Subtle backdrop */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] transition-opacity" />
      {/* Centered spinner */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      </div>
      {/* Top progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent">
        <div className="h-full bg-primary animate-[progress_0.4s_ease-in-out]" />
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}


