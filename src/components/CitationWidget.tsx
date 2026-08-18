"use client";

import { useState } from "react";
import { Check, Copy, Code2, Quote, Share2 } from "lucide-react";

export default function CitationWidget() {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"cite" | "embed">("cite");

  const citations = {
    APA: `KTM DECOR. (2026). The Impact of Neon Signage on Retail Foot Traffic in Nepal: 2026 Market Survey. KTM DECOR Research Division. https://www.decorktm.com/neon-sign-statistics-nepal`,
    MLA: `KTM DECOR. "The Impact of Neon Signage on Retail Foot Traffic in Nepal (2026 Data)." Decorktm.com, KTM DECOR, 2026, https://www.decorktm.com/neon-sign-statistics-nepal.`,
    Harvard: `KTM DECOR (2026) 'The Impact of Neon Signage on Retail Foot Traffic in Nepal', KTM DECOR Research. Available at: https://www.decorktm.com/neon-sign-statistics-nepal (Accessed: 2026).`,
    Web: `<a href="https://www.decorktm.com/neon-sign-statistics-nepal" title="Nepal Neon Sign Statistics 2026">KTM DECOR 2026 Signage & Foot Traffic Study</a>`,
  };

  const embedSnippet = `<div style="max-width:500px;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:sans-serif;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
  <span style="font-size:11px;font-weight:bold;color:#fe914c;text-transform:uppercase;letter-spacing:1px;">Market Finding 2026</span>
  <h4 style="margin:8px 0;font-size:18px;color:#111827;">+42% Average Increase in Foot Traffic & Social Tags</h4>
  <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;line-height:1.5;">Kathmandu cafes and retail stores with custom illuminated neon signs experienced a 42% surge in organic customer Instagram tags.</p>
  <div style="font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:10px;">
    Source: <a href="https://www.decorktm.com/neon-sign-statistics-nepal" target="_blank" rel="noopener" style="color:#fe914c;font-weight:bold;text-decoration:none;">KTM DECOR Research</a>
  </div>
</div>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2500);
  };

  return (
    <div className="bg-card border border-border rounded-[4px] p-6 sm:p-8 mt-12 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Share2 className="w-3.5 h-3.5" /> Media & Research Kit
          </div>
          <h3 className="text-xl font-bold text-foreground">Cite or Embed This Research</h3>
        </div>
        <div className="flex items-center gap-2 bg-muted/10 p-1 rounded-[4px] border border-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("cite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors ${
              activeTab === "cite"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Quote className="w-3.5 h-3.5" /> Citation
          </button>
          <button
            onClick={() => setActiveTab("embed")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-bold transition-colors ${
              activeTab === "embed"
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> Embed Widget
          </button>
        </div>
      </div>

      {activeTab === "cite" ? (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-muted">
            Journalists, bloggers, and academics are encouraged to cite this data. Select your preferred citation standard:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(citations) as Array<keyof typeof citations>).map((format) => (
              <div
                key={format}
                className="p-4 bg-background border border-border rounded-[4px] flex flex-col justify-between gap-3 group hover:border-accent/50 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">
                    {format} Format
                  </span>
                  <p className="text-xs font-mono text-muted/90 leading-relaxed line-clamp-3">
                    {citations[format]}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(citations[format], format)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-accent self-end transition-colors pt-2 border-t border-border/40 w-full justify-end"
                >
                  {copiedFormat === format ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-bold">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy {format}</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-muted">
            Embed this live statistics card into your website or blog with automatic backlink attribution:
          </p>
          <div className="relative bg-background border border-border p-4 rounded-[4px]">
            <pre className="text-xs font-mono text-muted/90 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
              {embedSnippet}
            </pre>
          </div>
          <button
            onClick={copyEmbed}
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto"
          >
            {embedCopied ? (
              <>
                <Check className="w-4 h-4" /> Embed HTML Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Embed HTML
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
