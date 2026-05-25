"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "rezumix-theme";
const THEME_CHANGE_EVENT = "rezumix-theme-change";

let currentTheme = "dark";
let themeInitialized = false;
const themeListeners = new Set();

function getThemeFromDOM() {
    if (typeof document === "undefined") {
        return "dark";
    }

    const root = document.documentElement;

    if (root.classList.contains("light")) {
        return "light";
    }

    if (root.classList.contains("dark")) {
        return "dark";
    }

    try {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        return storedTheme === "light" ? "light" : "dark";
    } catch {
        return "dark";
    }
}

function notifyThemeChange() {
    themeListeners.forEach((listener) => listener());
}

function applyTheme(theme) {
    if (typeof document === "undefined") {
        return;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.style.colorScheme = theme;
}

function setTheme(nextTheme) {
    const theme = nextTheme === "light" ? "light" : "dark";

    currentTheme = theme;
    applyTheme(theme);

    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore storage errors in environments that block localStorage.
    }

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
    }

    notifyThemeChange();
}

function subscribe(listener) {
    themeListeners.add(listener);

    if (typeof window !== "undefined") {
        const handleStorage = (event) => {
            if (event.key === THEME_STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
                currentTheme = event.newValue;
                applyTheme(currentTheme);
                listener();
            }
        };

        const handleThemeChange = (event) => {
            if (event.detail === "light" || event.detail === "dark") {
                currentTheme = event.detail;
                listener();
            }
        };

        window.addEventListener("storage", handleStorage);
        window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

        return () => {
            themeListeners.delete(listener);
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        };
    }

    return () => {
        themeListeners.delete(listener);
    };
}

function getSnapshot() {
    return currentTheme;
}

function getServerSnapshot() {
    return "dark";
}

export function useThemeMode() {
    if (!themeInitialized && typeof document !== "undefined") {
        currentTheme = getThemeFromDOM();
        themeInitialized = true;
    }

    const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    useEffect(() => {
        if (!themeInitialized) {
            currentTheme = getThemeFromDOM();
            themeInitialized = true;
            applyTheme(currentTheme);
            notifyThemeChange();
            return;
        }

        applyTheme(theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme(theme === "dark" ? "light" : "dark");
    }, [theme]);

    return {
        theme,
        isLight: theme === "light",
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
    };
}