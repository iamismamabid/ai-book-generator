"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

const DEFAULT_PROPERTY_ID = "6a8213867f692a1d48ab8025";
const DEFAULT_WIDGET_ID = "1k061oib5";

export default function TawkToChat() {
  const { user, isLoaded } = useUser();

  const propertyId =
    process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID || DEFAULT_PROPERTY_ID;
  const widgetId =
    process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID || DEFAULT_WIDGET_ID;

  useEffect(() => {
    if (!propertyId || !widgetId) return;

    // Initialize Tawk_API and Tawk_LoadStart
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Prevent duplicate script injection
    const scriptId = "tawk-to-script";
    if (document.getElementById(scriptId)) return;

    const s1 = document.createElement("script");
    s1.id = scriptId;
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, [propertyId, widgetId]);

  // Sync Clerk user details with Tawk.to session
  useEffect(() => {
    if (isLoaded && user && window.Tawk_API) {
      const email = user.primaryEmailAddress?.emailAddress;
      const name = user.fullName || user.firstName || "Customer";

      const attributes: Record<string, string> = {
        name: name,
        id: user.id,
      };
      if (email) {
        attributes.email = email;
      }

      if (typeof window.Tawk_API.setAttributes === "function") {
        window.Tawk_API.setAttributes(attributes, (error: any) => {
          if (error) console.error("Tawk.to setAttributes error:", error);
        });
      } else {
        window.Tawk_API.onLoad = function () {
          window.Tawk_API.setAttributes(attributes, (error: any) => {
            if (error) console.error("Tawk.to setAttributes error:", error);
          });
        };
      }
    }
  }, [isLoaded, user]);

  return null;
}
