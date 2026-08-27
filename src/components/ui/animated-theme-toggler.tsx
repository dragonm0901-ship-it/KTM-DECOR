"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "@/components/ui/solar-icons";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number;
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (theme === "dark" || resolvedTheme === "dark") : false;

  const toggleTheme = useCallback(() => {
    const applyTheme = () => {
      const newTheme = !isDark;
      document.documentElement.classList.toggle("dark", newTheme);
      setTheme(newTheme ? "dark" : "light");
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    try {
      const transition = document.startViewTransition(() => {
        flushSync(applyTheme);
      });

      if (transition?.finished) {
        transition.finished.catch(() => {});
      }
    } catch {
      applyTheme();
    }
  }, [isDark, setTheme]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      {mounted ? (
        <span className="relative flex items-center justify-center w-4 h-4">
          <Sun
            className={cn(
              "w-4 h-4 text-amber-500 transition-all duration-500 ease-in-out absolute inset-0",
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-75 opacity-0"
            )}
          />
          <Moon
            className={cn(
              "w-4 h-4 text-accent transition-all duration-500 ease-in-out absolute inset-0",
              isDark ? "rotate-45 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
            )}
          />
        </span>
      ) : (
        <div className="w-4 h-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
