"use client";

import { useEffect } from "react";

export default function RemoveLoader() {
    useEffect(() => {
        const loader = document.querySelector(".logo-loader-overlay");
        if (loader) {
            loader.classList.add("fade-out");
            setTimeout(() => loader.remove(), 400);
        }
    }, []);

    return null;
}
