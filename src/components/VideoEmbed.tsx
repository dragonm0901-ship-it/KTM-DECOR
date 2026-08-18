"use client";

import { useState } from "react";
import { Play, Sparkles } from "lucide-react";

export interface VideoEmbedProps {
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  youtubeId?: string;
  videoUrl?: string;
  duration?: string; // ISO 8601 e.g. "PT2M30S"
  caption?: string;
}

export default function VideoEmbed({
  title,
  description,
  thumbnailUrl,
  uploadDate,
  youtubeId = "dQw4w9WgXcQ", // fallback or demo
  videoUrl,
  duration = "PT1M45S",
  caption = "Behind the scenes at KTM DECOR Balkot Workshop",
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const embedUrl = youtubeId 
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`
    : videoUrl;

  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": title,
    "description": description,
    "thumbnailUrl": [thumbnailUrl],
    "uploadDate": uploadDate,
    "duration": duration,
    "embedUrl": embedUrl,
    "publisher": {
      "@type": "Organization",
      "name": "KTM DECOR",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.decorktm.com/logo/ktm%20decor.svg"
      }
    }
  };

  return (
    <div className="my-10 border border-border rounded-[4px] overflow-hidden bg-card shadow-lg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      
      <div className="relative aspect-video w-full bg-black">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-6">
              <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-sm border border-white/20 text-accent rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Workshop Video Guide
              </span>
              
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-white mb-1 drop-shadow-md">
                    {title}
                  </h4>
                  <p className="text-xs text-white/80 line-clamp-1">
                    {caption}
                  </p>
                </div>

                <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-[0_0_25px_rgba(254,145,76,0.6)] group-hover:scale-110 transition-transform shrink-0">
                  <Play className="w-6 h-6 ml-0.5 fill-current" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/10 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted">
        <span>🎬 Video Guide: {title}</span>
        <span className="font-semibold text-foreground">Verified KTM DECOR Fabrication Standards</span>
      </div>
    </div>
  );
}
