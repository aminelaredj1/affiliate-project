"use client";

import Image from "next/image";
import { useState } from "react";

interface AffiliateProductCardProps {
  title: string;
  description: string;
  imageUrl: string;
  affiliateUrl: string;
  price?: string;
}

export default function AffiliateProductCard({
  title,
  description,
  imageUrl,
  affiliateUrl,
  price,
}: AffiliateProductCardProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);

    // Track the click by sending it to our backend endpoint
    try {
      await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productTitle: title, affiliateUrl }),
      });
    } catch (e) {
      console.error("Failed to track click", e);
    }
    
    // Open affiliate URL in new tab
    window.open(affiliateUrl, "_blank");
  };

  return (
    <div className="rounded-3xl p-6 flex flex-col h-full bg-[#e8f0f8] shadow-neu-flat transition-shadow hover:shadow-neu-pressed">
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-inner mb-6">
        {/* Placeholder if no image provided */}
        <div className="w-full h-full bg-[#d1dce5] flex items-center justify-center text-navy/50">
          {imageUrl ? (
             <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
          ) : (
            <span>Image</span>
          )}
        </div>
      </div>
      
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
        {price && <p className="text-gold font-semibold mb-3">{price}</p>}
        <p className="text-navy/80 text-sm leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <button
        onClick={handleClick}
        className={`mt-auto w-full py-4 rounded-xl font-bold text-lg transition-all duration-200
          ${isClicked 
            ? 'shadow-neu-navy-pressed text-sky/90' 
            : 'shadow-neu-navy text-sky hover:text-white'
          } bg-navy`}
      >
        Get the Deal
      </button>
    </div>
  );
}
