import React from "react";
import { cn } from "@/lib/utils";
// Animated placeholder component
const AnimatedPlaceholder = ({

    prefix = "Search the ",
    words = ["Carpets", "Mobile Phones", "Electronics", "Grocery"],
    intervalMs = 5000,
    delayMs = 300,
}: {
    prefix?: string;
    words?: string[];
    intervalMs?: number;
    delayMs?: number;
}) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [animationState, setAnimationState] = React.useState<"idle" | "exit" | "enter">("idle");

    React.useEffect(() => {
        const interval = setInterval(() => {
            // Start exit animation (current word goes up)
            setAnimationState("exit");

            // After exit animation + delay, change word and start enter animation
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % words.length);
                setAnimationState("enter");

                // Reset to idle after enter animation completes
                setTimeout(() => {
                    setAnimationState("idle");
                }, 300);
            }, delayMs); // Exit duration + delay

        }, intervalMs);

        return () => clearInterval(interval);
    }, [words.length, intervalMs, delayMs]);

    const currentWord = words[currentIndex];

    return (
        <div className="flex items-center text-gray-400 pointer-events-none select-none">
            <span>{prefix}</span>
            <div className="mx-1 relative h-5 overflow-hidden">
                <div
                    className={cn(
                        "h-5 flex items-center transition-all duration-300 ease-in-out",
                        animationState === "idle" && "translate-y-0 opacity-100",
                        animationState === "exit" && "-translate-y-full opacity-0",
                        animationState === "enter" && "translate-y-0 opacity-100",
                    )}
                    style={{
                        transform: animationState === "enter" ? undefined : undefined,
                    }}
                >
                    <span
                        className={cn(
                            "transition-all duration-300 ease-out",
                            animationState === "enter" && "animate-slide-up"
                        )}
                        style={{
                            display: "inline-block",
                            animation: animationState === "enter"
                                ? "slideUpIn 0.5s ease-out forwards"
                                : animationState === "exit"
                                    ? "slideUpOut 0.5s ease-in forwards"
                                    : "none",
                        }}
                    >
                        {currentWord}
                    </span>
                </div>
            </div>

            {/* Keyframe styles */}
            <style jsx>{`
                @keyframes slideUpOut {
                    0% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                }
                @keyframes slideUpIn {
                    0% {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

export default AnimatedPlaceholder;
