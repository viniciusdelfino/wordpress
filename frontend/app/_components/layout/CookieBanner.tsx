// CookieBanner.tsx
"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (!consent) setVisible(true);
    }, []);

    const handleChoice = (choice: "accepted" | "rejected") => {
        localStorage.setItem("cookie_consent", choice);
        setVisible(false);
    };
 
    if (!visible) return null;

    return (
        <div className="fixed bottom-0 w-full bg-dark-blue p-4 z-50 lg:h-[96px] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)]">
            <div className="h-full grid grid-row-2 lg:flex flex-row text-black gap-4 md:px-18 items-center">
                <span>
                    <p className="text-white">Armazenamos cookies em seu dispositivo para proporcionar uma melhor experiência. Ao utilizar esse site, você concorda com nossa <a className="underline" href="https://moovelub.com/politica.php" target="_blank">Política de privacidade.</a></p>
                </span>
                <span className="flex flex-row h-[37px] gap-4 lg:items-center">
                    <button className="w-[171px] h-full border border-white text-white rounded-sm" onClick={() => handleChoice("rejected")}>Rejeitar</button>
                    <button className="w-[171px] h-full border border-white bg-white text-dark-blue rounded-sm" onClick={() => handleChoice("accepted")}>Aceitar</button>
                </span>
            </div>
        </div>
    );
}