"use client";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SessionWrapper({ children, session }) {
    const [devSession, setDevSession] = useState(session);

    useEffect(() => {
        if (session) {
            setDevSession(session);
            return;
        }

        try {
            const storedSession = window.localStorage.getItem("rezumix-dev-session");
            if (storedSession) {
                setDevSession(JSON.parse(storedSession));
            }
        } catch {
            setDevSession(session);
        }
    }, [session]);

    return (
        <SessionProvider session={devSession}>
            {children}
        </SessionProvider>
    );
}
