"use client";

import { useState, useEffect } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface LandingWrapperProps {
    children: React.ReactNode;
    menuItems?: Array<{ label: string; href: string }>;
}

export default function LandingWrapper({ children, menuItems }: LandingWrapperProps) {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <div className={theme === "dark" ? "dark" : ""}>
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-colors duration-300 min-h-screen">
                <Header theme={theme} toggleTheme={toggleTheme} menuItems={menuItems} />
                
                {children}
                
                <Footer />

                {/* Custom Animations */}
                <style jsx global>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                    }
                    
                    .animate-float-delayed {
                        animation: float 3s ease-in-out infinite;
                        animation-delay: 1.5s;
                    }

                    * {
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    html {
                        scroll-behavior: smooth;
                    }
                `}</style>
            </div>
        </div>
    );
}