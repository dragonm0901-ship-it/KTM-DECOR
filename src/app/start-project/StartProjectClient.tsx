"use client";

import { useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { 
  ArrowLeft, 
  MessageCircle, 
  Upload, 
  Sun, 
  Moon, 
  Sparkles, 
  Type, 
  Sliders, 
  Palette, 
  Layout, 
  Maximize2, 
  Check, 
  Info,
  Ruler,
  AlertCircle,
  FileImage,
  Trash2,
  Image as ImageIcon,
  ShoppingBag
} from "@/components/ui/solar-icons";
import Link from "next/link";
import { Product } from "@/data/shop-data";

// Predefined available Google Fonts
const AVAILABLE_FONTS = [
  { id: "Outfit", name: "Modern Sans (Outfit)", url: "", family: "var(--font-outfit), sans-serif" },
  { id: "Dancing Script", name: "Cursive Script (Dancing Script)", url: "", family: "var(--font-dancing-script), cursive" },
  { id: "Monoton", name: "Retro Neon (Monoton)", url: "", family: "var(--font-monoton), cursive" },
  { id: "Montserrat", name: "Extra Bold (Montserrat)", url: "", family: "var(--font-montserrat), sans-serif" },
  { id: "Playfair Display", name: "Classic Serif (Playfair Display)", url: "", family: "var(--font-playfair-display), serif" },
  { id: "Pacifico", name: "Vintage Script (Pacifico)", url: "", family: "var(--font-pacifico), cursive" }
];

// Curated Glowing & Extrusion Color Palettes
const GLOW_COLORS = [
  { id: "orange", name: "KTM Orange", hex: "#FE914C", rgb: "254, 145, 76" },
  { id: "blue", name: "Ice Blue", hex: "#00E5FF", rgb: "0, 229, 255" },
  { id: "green", name: "Neon Green", hex: "#39FF14", rgb: "57, 255, 20" },
  { id: "pink", name: "Hot Pink", hex: "#FF007F", rgb: "255, 0, 127" },
  { id: "purple", name: "Amethyst Purple", hex: "#B336FF", rgb: "179, 54, 255" },
  { id: "red", name: "Crimson Red", hex: "#FF073A", rgb: "255, 7, 58" },
  { id: "yellow", name: "Lemon Yellow", hex: "#CCFF00", rgb: "204, 255, 0" },
  { id: "white", name: "Warm White", hex: "#FFFDD0", rgb: "255, 253, 208" }
];

// Backplate Material Styles
const BACKPLATE_MATERIALS = [
  { id: "clear", name: "Transparent Acrylic", description: "Glassy clear look with reflection accents" },
  { id: "walnut", name: "Premium CNC Walnut Wood", description: "Rich, joined hardwood texture with carved deboss depth" },
  { id: "metal", name: "Matte Black Metal Plate", description: "Sleek industrial finish with corner rivet bolts" },
  { id: "steel", name: "Brushed Steel Sheet", description: "Metallic satin reflection matching modern lobbies" }
];

// Backplate Shapes
const BACKPLATE_SHAPES = [
  { id: "cut-to-shape", name: "Contoured Shape", description: "Cut precisely around the text outline" },
  { id: "rectangle", name: "Classic Rectangle", description: "Clean linear square boundary format" },
  { id: "circle", name: "Modern Circular", description: "Perfect circular backing disc" },
  { id: "none", name: "No Backing Board", description: "Direct wall mount (text only)" }
];

// Mounting Hardware Configurations
const MOUNTING_STYLES = [
  { id: "studs", name: "Wall Standoff Studs", description: "Metallic spacers to float the board off the wall" },
  { id: "chain", name: "Suspended Hanging Chains", description: "Premium golden or silver chains for store windows" },
  { id: "adhesive", name: "Heavy-Duty Mounting Adhesive", description: "Clean, flush direct surface mount without drilling" }
];

// Main Customization App Route Page
export default function StartProjectClient() {
  // --- STATE SYSTEM ---
  const [boardType, setBoardType] = useState<"neon" | "wood" | "acrylic3d" | "backlit">("neon");
  
  // Custom Branding Layout Mode
  const [brandingMode, setBrandingMode] = useState<"text" | "logo" | "both">("text");
  
  const [text, setText] = useState("KTM DECOR");
  const [selectedFont, setSelectedFont] = useState(AVAILABLE_FONTS[0]);
  const [selectedColor, setSelectedColor] = useState(GLOW_COLORS[0]);
  const [backplateMaterial, setBackplateMaterial] = useState(BACKPLATE_MATERIALS[0]);
  const [backplateShape, setBackplateShape] = useState(BACKPLATE_SHAPES[0]);
  const [mountingStyle, setMountingStyle] = useState(MOUNTING_STYLES[0]);
  
  // Custom Sizing Parameters
  const [widthInches, setWidthInches] = useState(30);
  const [heightInches, setHeightInches] = useState(18);
  const [fontSizeRatio, setFontSizeRatio] = useState(1.4); // scale multiplier
  
  // Live Sandbox Background wall Options
  const [isNightMode, setIsNightMode] = useState(true);
  const [wallType, setWallType] = useState<"brick" | "concrete" | "minimal">("brick");
  
  // Custom Logo Upload states
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [uploadedLogoName, setUploadedLogoName] = useState<string | null>(null);
  const [uploadedLogoSize, setUploadedLogoSize] = useState<string | null>(null);
  
  // Active Navigation Configuration Tab
  const [activeTab, setActiveTab] = useState<"type" | "text" | "colors" | "material" | "mounting">("type");

  // Custom Screenshot Capture & WhatsApp flow states
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [logoScale, setLogoScale] = useState(1.0);

  // Handle Board Type Switch Defaults
  const handleBoardTypeChange = (type: "neon" | "wood" | "acrylic3d" | "backlit") => {
    setBoardType(type);
    if (type === "wood") {
      const woodMat = BACKPLATE_MATERIALS.find(m => m.id === "walnut");
      if (woodMat) setBackplateMaterial(woodMat);
      
      const rectShape = BACKPLATE_SHAPES.find(s => s.id === "rectangle");
      if (rectShape) setBackplateShape(rectShape);
    } else if (type === "neon") {
      const clearMat = BACKPLATE_MATERIALS.find(m => m.id === "clear");
      if (clearMat) setBackplateMaterial(clearMat);
    } else if (type === "acrylic3d") {
      const metalMat = BACKPLATE_MATERIALS.find(m => m.id === "metal");
      if (metalMat) setBackplateMaterial(metalMat);
    } else if (type === "backlit") {
      const steelMat = BACKPLATE_MATERIALS.find(m => m.id === "steel");
      if (steelMat) setBackplateMaterial(steelMat);
    }
  };

  // Handle Logo Upload Mock URL generator
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogoName(file.name);
      
      // Calculate file size in KB or MB
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      setUploadedLogoSize(sizeStr);

      // Convert file to base64 for 100% CORS-proof canvas exporting
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedLogoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logo Removal
  const handleRemoveLogo = () => {
    setUploadedLogoUrl(null);
    setUploadedLogoName(null);
    setUploadedLogoSize(null);
    setLogoScale(1.0);
  };

  // WhatsApp Link compiler and redirector
  const handleRedirectToWhatsApp = () => {
    const boardNames = {
      neon: "Neon Light Signboard",
      wood: "CNC Engraved Hardwood Board",
      acrylic3d: "3D Extruded Acrylic Letters Board",
      backlit: "Halo Backlit LED Board"
    };

    const signStyle = boardNames[boardType];
    const brandingText = brandingMode !== "logo" ? text || "N/A" : "Logo Design Only";
    const fontText = brandingMode !== "logo" ? `using the beautiful "${selectedFont.name}" typography` : "";
    const colorText = selectedColor.name;
    const materialText = backplateMaterial.name;
    const sizeText = `${widthInches}" wide x ${heightInches}" high`;

    const message = `*Can I get a custom signboard design like this?* 🎨🤔

👋 Hello KTM DECOR Lead Designer,

I've just finished crafting a custom signboard design on your website and would love to get a professional price quote for my space! 

Here are the custom options I selected in the studio:
✨ *Signboard Style:* ${signStyle}
✨ *My Custom Text:* "${brandingText}" ${fontText}
✨ *Glow / LED Accent:* Beautiful "${colorText}" lighting
✨ *Backplate Material:* Crafted on ${materialText}
✨ *Physical Dimensions:* ${sizeText}

I have automatically saved the visual blueprint image of my custom design (saved as "ktm-decor-design.png") and attached it directly to this chat so you can see my exact design layout! 

Could you please let me know the pricing and estimated fabrication timeline for this custom project?

Thank you so much!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = "9779706247439"; // Direct lead desk
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
    setShowSuccessModal(false);
  };

  // Add custom design to Global E-Commerce Cart
  const handleAddToCart = () => {
    const boardNames = {
      neon: "Neon Light Signboard",
      wood: "CNC Engraved Hardwood Board",
      acrylic3d: "3D Extruded Acrylic Letters Board",
      backlit: "Halo Backlit LED Board"
    };

    const signStyle = boardNames[boardType];
    const brandingText = brandingMode !== "logo" ? text || "N/A" : "Logo Design Only";
    const materialText = backplateMaterial.name;
    const sizeText = `${widthInches}" W x ${heightInches}" H`;

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: `Custom Signboard (${brandingText.slice(0, 15)}${brandingText.length > 15 ? "..." : ""})`,
      category: "Neon Signs",
      subCategory: signStyle,
      price: 0, // Quote-based
      image: capturedImage || "/images/hero-01.webp",
      description: `Custom ${signStyle} configured in the KTM DECOR Design Studio. Backing material: ${materialText}, dimensions: ${sizeText}.`,
      dimensions: sizeText,
      specs: [
        `Style: ${signStyle}`,
        `Custom Branding: ${brandingText}`,
        `LED Glow Tint: ${selectedColor.name}`,
        `Backplate Material: ${materialText}`,
        `Physical Dimensions: ${sizeText}`
      ],
      rating: 5,
      reviewsCount: 0,
      stockStatus: "Custom Order Only"
    };

    window.dispatchEvent(
      new CustomEvent("ktm-decor-add-to-cart", {
        detail: { product: customProduct, quantity: 1 }
      })
    );

    setShowSuccessModal(false);
  };

  // Capture Canvas Screenshot and Download
  const handleSendToWhatsApp = () => {
    const element = document.getElementById("design-sandbox-canvas");
    if (!element) {
      handleRedirectToWhatsApp();
      return;
    }

    setIsCapturing(true);

    // 1. Temporarily filter document.styleSheets to bypass inaccessible cross-origin sheets (like extension styles)
    const originalStyleSheets = document.styleSheets;
    const filteredSheets = Array.from(originalStyleSheets).filter((sheet) => {
      try {
        // Accessing cssRules will throw a SecurityError on cross-origin stylesheets
        const rules = sheet.cssRules;
        return true;
      } catch (err) {
        return false;
      }
    });

    try {
      Object.defineProperty(document, "styleSheets", {
        get() {
          return filteredSheets;
        },
        configurable: true
      });
    } catch (err) {}

    const restoreStyleSheets = () => {
      try {
        Object.defineProperty(document, "styleSheets", {
          get() {
            return originalStyleSheets;
          },
          configurable: true
        });
      } catch (err) {}
    };

    toPng(element, {
      cacheBust: true,
      backgroundColor: isNightMode ? "#0f0f13" : "#e4e4e7",
      style: {
        transform: "scale(1)",
        transformOrigin: "center",
      }
    })
    .then((dataUrl) => {
      setCapturedImage(dataUrl);
      
      // Auto-trigger screenshot download
      const link = document.createElement("a");
      link.download = `ktm-decor-design-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      setIsCapturing(false);
      setShowSuccessModal(true);
      
      // Restore original stylesheets list
      restoreStyleSheets();
    })
    .catch((err) => {
      console.error("Screenshot export failed:", err);
      setIsCapturing(false);
      alert("We encountered an issue exporting your custom blueprint. Please try again or download via browser controls.");
      
      // Restore original stylesheets list on failure
      restoreStyleSheets();
    });
  };

  // Helper styles based on selected backing material
  const getMaterialStyle = () => {
    switch (backplateMaterial.id) {
      case "walnut":
        return "bg-gradient-to-br from-[#2f1a12] via-[#3a2217] to-[#20120c] border border-amber-950/40 shadow-inner relative overflow-hidden";
      case "clear":
        return "bg-white/10 dark:bg-white/5 border border-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden";
      case "metal":
        return "bg-gradient-to-br from-[#121212] via-[#1c1c1e] to-[#0d0d0f] border border-neutral-800 shadow-2xl relative overflow-hidden";
      case "steel":
        return "bg-gradient-to-br from-[#d4d4d8] via-[#e4e4e7] to-[#b5b5ba] dark:from-[#2e2e33] dark:via-[#3e3e44] dark:to-[#222227] border border-neutral-400 dark:border-neutral-800 shadow-2xl relative overflow-hidden";
      default:
        return "";
    }
  };

  // Helper styles for selected backplate shape
  const getShapeStyle = () => {
    if (backplateShape.id === "none" && boardType !== "wood" && boardType !== "backlit") return "bg-transparent border-none shadow-none";
    
    switch (backplateShape.id) {
      case "circle":
        return "rounded-full aspect-square max-w-[340px] sm:max-w-[420px] mx-auto flex items-center justify-center p-8";
      case "rectangle":
        return "rounded-md w-full aspect-[16/9] flex items-center justify-center p-8";
      case "cut-to-shape":
      default:
        return "rounded-2xl w-[95%] aspect-[16/8] flex items-center justify-center p-6";
    }
  };

  // Live design text styling renderer
  const getLiveTextStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      fontFamily: selectedFont.family,
      fontSize: `${fontSizeRatio * 2.1}rem`,
      lineHeight: "1.2",
      textAlign: "center",
      transition: "all 0.3s ease",
      wordBreak: "break-word"
    };

    if (boardType === "neon") {
      return {
        ...base,
        color: "#ffffff",
        textShadow: isNightMode 
          ? `0 0 5px #fff, 0 0 10px ${selectedColor.hex}, 0 0 20px ${selectedColor.hex}, 0 0 40px ${selectedColor.hex}, 0 0 60px ${selectedColor.hex}`
          : `0 0 3px #fff, 0 0 8px ${selectedColor.hex}, 0 0 15px ${selectedColor.hex}`
      };
    }

    if (boardType === "wood") {
      return {
        ...base,
        color: "rgba(0, 0, 0, 0.65)",
        textShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 1px rgba(255, 255, 255, 0.15)",
        fontWeight: "900"
      };
    }

    if (boardType === "acrylic3d") {
      return {
        ...base,
        color: selectedColor.hex,
        fontWeight: "800",
        textShadow: isNightMode
          ? `0 1px 0 #d4d4d8, 0 2px 0 #a1a1aa, 0 3px 0 #71717a, 0 4px 0 #52525b, 0 6px 12px rgba(0,0,0,0.6), 0 0 10px ${selectedColor.hex}50`
          : `0 1px 0 #d4d4d8, 0 2px 0 #a1a1aa, 0 3px 0 #71717a, 0 4px 0 #52525b, 0 5px 10px rgba(0,0,0,0.3)`
      };
    }

    if (boardType === "backlit") {
      return {
        ...base,
        color: "#ffffff",
        fontWeight: "700",
        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
      };
    }

    return base;
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 md:pt-36 lg:pt-44 pb-16 flex flex-col items-center">
      
      {/* ── Header Title Row ── */}
      <div className="w-full max-w-[1500px] px-4 sm:px-6 md:px-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link 
            href="/" 
            className="relative z-10 inline-flex items-center gap-2 text-xs text-muted hover:text-foreground tracking-widest uppercase transition-colors mb-3 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Showroom
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
            Custom Design Studio <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </h1>
          <p className="text-muted text-sm max-w-xl mt-1">
            Build your dream board. Interact with the live sandbox, customize materials, and push directly to WhatsApp for a custom quote.
          </p>
        </div>

        {/* Day/Night View controllers */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex bg-card border border-border p-1 rounded-[4px] text-xs">
            <button 
              onClick={() => setIsNightMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] font-bold transition-all ${isNightMode ? 'bg-accent text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              <Moon className="w-3.5 h-3.5" /> Night View
            </button>
            <button 
              onClick={() => setIsNightMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] font-bold transition-all ${!isNightMode ? 'bg-accent text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              <Sun className="w-3.5 h-3.5" /> Day View
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Split View Sandbox Layout ── */}
      <div className="w-full max-w-[1500px] px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: Interactive Sticky Live Preview Sandbox ── */}
        <div className="lg:col-span-7 xl:col-span-8 lg:sticky lg:top-28">
          <div 
            id="design-sandbox-canvas"
            className={`w-full aspect-[16/10] min-h-[320px] sm:min-h-[440px] md:min-h-[500px] rounded-lg border border-border relative flex items-center justify-center transition-all duration-500 overflow-hidden shadow-2xl ${
              isNightMode 
                ? 'bg-[#0f0f13]' 
                : 'bg-zinc-200'
            }`}
          >
            {/* Wall Textures simulation */}
            {wallType === "brick" && (
              <div 
                className={`absolute inset-0 opacity-15 pointer-events-none ${isNightMode ? 'invert' : ''}`}
                style={{
                  backgroundImage: `radial-gradient(circle, transparent 20%, #1e1e1e 20%, #1e1e1e 21%, transparent 21%), 
                                    linear-gradient(to right, transparent 50%, #1e1e1e 50%, #1e1e1e 51%, transparent 51%), 
                                    linear-gradient(to bottom, transparent 50%, #1e1e1e 50%, #1e1e1e 51%, transparent 51%)`,
                  backgroundSize: '40px 40px, 40px 20px, 40px 20px'
                }}
              />
            )}
            
            {wallType === "concrete" && (
              <div 
                className={`absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay`}
                style={{
                  backgroundImage: `radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)`,
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 8px 8px'
                }}
              />
            )}

            {/* Backlit LED Halo Projection */}
            {(boardType === "backlit" || (boardType === "neon" && isNightMode)) && (
              <div 
                className="absolute w-[80%] aspect-[16/8] rounded-2xl blur-[45px] transition-all duration-500"
                style={{
                  backgroundColor: selectedColor.hex,
                  opacity: isNightMode ? 0.45 : 0.22,
                  transform: "scale(1.05)"
                }}
              />
            )}

            {/* Simulated Hanging Chains Overlay */}
            {mountingStyle.id === "chain" && (
              <div className="absolute top-0 left-0 right-0 h-1/3 flex justify-between px-20 pointer-events-none z-10">
                <div className="w-[2px] h-full border-l-2 border-dashed border-neutral-600 dark:border-neutral-400" />
                <div className="w-[2px] h-full border-l-2 border-dashed border-neutral-600 dark:border-neutral-400" />
              </div>
            )}

            {/* ── THE LIVE BOARD CONTAINER ── */}
            <div 
              className={`transition-all duration-500 flex items-center justify-center ${getShapeStyle()} ${getMaterialStyle()}`}
              style={{
                boxShadow: isNightMode 
                  ? '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.5)'
                  : '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
              }}
            >
              {/* Walnut Wood Carving Planks Seams lines */}
              {backplateMaterial.id === "walnut" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-1 opacity-25">
                  <div className="w-full h-[1px] bg-black/40 border-b border-white/5" />
                  <div className="w-full h-[1px] bg-black/40 border-b border-white/5" />
                  <div className="w-full h-[1px] bg-black/40 border-b border-white/5" />
                </div>
              )}

              {/* Glass Reflection glare sheen */}
              {backplateMaterial.id === "clear" && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] skew-x-12 transform scale-150" />
              )}

              {/* Corner Screw Rivets / Spacers for Metal / Wood Plates */}
              {(backplateMaterial.id === "metal" || backplateMaterial.id === "walnut" || backplateMaterial.id === "steel") && backplateShape.id !== "none" && (
                <>
                  <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700 border border-black/40 shadow shadow-black/80 flex items-center justify-center text-[5px] text-black font-black leading-none z-10" />
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700 border border-black/40 shadow shadow-black/80 flex items-center justify-center text-[5px] text-black font-black leading-none z-10" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700 border border-black/40 shadow shadow-black/80 flex items-center justify-center text-[5px] text-black font-black leading-none z-10" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-700 border border-black/40 shadow shadow-black/80 flex items-center justify-center text-[5px] text-black font-black leading-none z-10" />
                </>
              )}

              {/* Acrylic standoffs backing spacers */}
              {backplateMaterial.id === "clear" && backplateShape.id !== "none" && (
                <>
                  <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white/20 border border-white/40 shadow-inner z-10" />
                  <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-white/20 border border-white/40 shadow-inner z-10" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-white/20 border border-white/40 shadow-inner z-10" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-white/20 border border-white/40 shadow-inner z-10" />
                </>
              )}

              {/* ── SANDBOX CONTENT STAGE ── */}
              <div className="flex flex-col items-center justify-center relative w-full h-full p-4 z-20">
                
                {/* A. Live logo design layout */}
                {(brandingMode === "logo" || brandingMode === "both") && (
                  <div className="relative mb-3 flex items-center justify-center">
                    {uploadedLogoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={uploadedLogoUrl} 
                        alt="Uploaded Logo Design Preview" 
                        className={`object-contain max-h-[140px] max-w-[220px] transition-all duration-300`}
                        style={{
                          transform: `scale(${logoScale})`,
                          filter: boardType === "backlit" || boardType === "neon"
                            ? `drop-shadow(0 0 15px ${selectedColor.hex}) brightness(1.2)`
                            : boardType === "wood" 
                              ? "contrast(1.8) brightness(0.28) opacity(0.8)"
                              : boardType === "acrylic3d"
                                ? `drop-shadow(0 4px 6px rgba(0,0,0,0.5)) saturate(1.5)`
                                : "none"
                        }}
                      />
                    ) : (
                      /* Elegant interactive placeholder monogram badge */
                      <div 
                        className={`w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all ${
                          boardType === "wood" 
                            ? "border-black/35 text-black/50" 
                            : "border-neutral-400/50 text-neutral-400"
                        }`}
                        style={{
                          transform: `scale(${logoScale})`,
                          borderColor: boardType === "neon" || boardType === "backlit" ? selectedColor.hex : "",
                          boxShadow: boardType === "neon" || boardType === "backlit" ? `0 0 12px ${selectedColor.hex}25` : "",
                          textShadow: boardType === "neon" || boardType === "backlit" ? `0 0 4px ${selectedColor.hex}` : ""
                        }}
                      >
                        <ImageIcon className="w-8 h-8 mb-1.5 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest uppercase">Your Logo</span>
                        <span className="text-[8px] opacity-75 mt-0.5">Upload file</span>
                      </div>
                    )}
                  </div>
                )}

                {/* B. Live custom text layout */}
                {brandingMode !== "logo" && (
                  <p 
                    style={getLiveTextStyles()}
                    className="transition-all select-none max-w-full font-bold"
                  >
                    {text || "ENTER TEXT"}
                  </p>
                )}

                {/* C. Transparent backing tubing lines */}
                {boardType === "neon" && backplateShape.id !== "none" && (
                  <div className="absolute inset-0 border border-white/[0.04] rounded-xl pointer-events-none opacity-20" />
                )}
              </div>
            </div>

            {/* Sizing Specifications Badge */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-[4px] text-[10px] sm:text-xs font-bold tracking-wider uppercase text-white/90 border border-white/10 flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-accent" />
              <span>{widthInches}" W x {heightInches}" H</span>
            </div>

            {/* Wall texture togglers */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1 rounded-[4px] border border-white/10">
              <button 
                onClick={() => setWallType("brick")}
                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-[2px] transition-all ${wallType === "brick" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
              >
                Brick
              </button>
              <button 
                onClick={() => setWallType("concrete")}
                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-[2px] transition-all ${wallType === "concrete" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
              >
                Cement
              </button>
              <button 
                onClick={() => setWallType("minimal")}
                className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-[2px] transition-all ${wallType === "minimal" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"}`}
              >
                Plaster
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Configuration Customizer Controls Deck ── */}
        <div className="lg:col-span-5 xl:col-span-4 bg-card border border-border rounded-lg p-6 sm:p-8 shadow-xl flex flex-col gap-6">
          
          {/* Tab Selector Headers */}
          <div className="grid grid-cols-5 bg-background p-1 rounded-[4px] border border-border text-muted-foreground text-xs">
            <button 
              onClick={() => setActiveTab("type")}
              className={`flex flex-col items-center gap-1 py-2 rounded-[3px] transition-all ${activeTab === "type" ? 'bg-card text-accent font-bold border border-border shadow-sm' : 'hover:text-foreground'}`}
              title="Category"
            >
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Type</span>
            </button>
            <button 
              onClick={() => setActiveTab("text")}
              className={`flex flex-col items-center gap-1 py-2 rounded-[3px] transition-all ${activeTab === "text" ? 'bg-card text-accent font-bold border border-border shadow-sm' : 'hover:text-foreground'}`}
              title="Text & Branding"
            >
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Branding</span>
            </button>
            <button 
              onClick={() => setActiveTab("colors")}
              className={`flex flex-col items-center gap-1 py-2 rounded-[3px] transition-all ${activeTab === "colors" ? 'bg-card text-accent font-bold border border-border shadow-sm' : 'hover:text-foreground'}`}
              title="Color"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Color</span>
            </button>
            <button 
              onClick={() => setActiveTab("material")}
              className={`flex flex-col items-center gap-1 py-2 rounded-[3px] transition-all ${activeTab === "material" ? 'bg-card text-accent font-bold border border-border shadow-sm' : 'hover:text-foreground'}`}
              title="Board Plate"
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Board</span>
            </button>
            <button 
              onClick={() => setActiveTab("mounting")}
              className={`flex flex-col items-center gap-1 py-2 rounded-[3px] transition-all ${activeTab === "mounting" ? 'bg-card text-accent font-bold border border-border shadow-sm' : 'hover:text-foreground'}`}
              title="Mounting & Sizing"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline text-[9px] uppercase tracking-wider">Specs</span>
            </button>
          </div>

          {/* ── TAB 1: BOARD TYPE SELECTION ── */}
          {activeTab === "type" && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-2">
                1. Select Board Category
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleBoardTypeChange("neon")}
                  className={`w-full p-4 rounded-[4px] border text-left flex items-start gap-4 transition-all ${boardType === "neon" ? 'bg-accent/[0.04] border-accent shadow-md' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${boardType === "neon" ? 'border-accent text-accent' : 'border-border'}`}>
                    {boardType === "neon" && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Neon Light Board</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Vibrant hand-bent glowing neon script mounted on premium backing plates.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleBoardTypeChange("wood")}
                  className={`w-full p-4 rounded-[4px] border text-left flex items-start gap-4 transition-all ${boardType === "wood" ? 'bg-accent/[0.04] border-accent shadow-md' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${boardType === "wood" ? 'border-accent text-accent' : 'border-border'}`}>
                    {boardType === "wood" && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">CNC Walnut Carving</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Debossed typography and business logos precision-engraved directly into wood blocks.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleBoardTypeChange("acrylic3d")}
                  className={`w-full p-4 rounded-[4px] border text-left flex items-start gap-4 transition-all ${boardType === "acrylic3d" ? 'bg-accent/[0.04] border-accent shadow-md' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${boardType === "acrylic3d" ? 'border-accent text-accent' : 'border-border'}`}>
                    {boardType === "acrylic3d" && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">3D Acrylic Letters</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Extruded block letters with beautiful bevel details and glossy colorful faces.</p>
                  </div>
                </button>

                <button
                  onClick={() => handleBoardTypeChange("backlit")}
                  className={`w-full p-4 rounded-[4px] border text-left flex items-start gap-4 transition-all ${boardType === "backlit" ? 'bg-accent/[0.04] border-accent shadow-md' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border ${boardType === "backlit" ? 'border-accent text-accent' : 'border-border'}`}>
                    {boardType === "backlit" && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Halo Backlit LED Board</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">Modern signage plates throwing intense ambient lighting back onto the wall.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: TEXT & BRANDING LOGO (RESTRUCTURED FOR MAX ACCESSIBILITY) ── */}
          {activeTab === "text" && (
            <div className="space-y-6">
              
              {/* Branding Mode Selector */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                  Choose Layout Style
                </h3>
                <div className="grid grid-cols-3 bg-background border border-border p-1 rounded-[4px] text-[10px]">
                  <button
                    onClick={() => setBrandingMode("text")}
                    className={`py-2 text-center rounded-[2px] font-bold transition-all ${brandingMode === "text" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}
                  >
                    Text Only
                  </button>
                  <button
                    onClick={() => setBrandingMode("logo")}
                    className={`py-2 text-center rounded-[2px] font-bold transition-all ${brandingMode === "logo" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}
                  >
                    Logo Design
                  </button>
                  <button
                    onClick={() => setBrandingMode("both")}
                    className={`py-2 text-center rounded-[2px] font-bold transition-all ${brandingMode === "both" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"}`}
                  >
                    Logo & Text
                  </button>
                </div>
              </div>

              {/* Live custom text configuration (shown in Text & Both modes) */}
              {brandingMode !== "logo" && (
                <div className="space-y-4 pt-1 border-t border-border/50">
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                      Sign Custom Text
                    </h3>
                    <input 
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, 32))}
                      placeholder="e.g. KTM DECOR"
                      className="w-full px-4 py-3 bg-background border border-border rounded-[4px] text-foreground focus:outline-none focus:border-accent text-sm"
                    />
                    <span className="text-[10px] text-muted block text-right">
                      {text.length}/32 characters limit
                    </span>
                  </div>

                  {/* Fonts lists */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                      Select Typography Font
                    </h3>
                    <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {AVAILABLE_FONTS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setSelectedFont(font)}
                          style={{ fontFamily: font.family }}
                          className={`w-full px-4 py-2.5 rounded-[4px] border text-left text-xs flex items-center justify-between transition-all ${selectedFont.id === font.id ? 'bg-accent/[0.04] border-accent font-bold text-accent' : 'bg-background hover:bg-foreground/[0.02] border-border text-foreground'}`}
                        >
                          <span>{font.name}</span>
                          {selectedFont.id === font.id && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size adjusters */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-foreground/80">
                      <span>Relative Text Size</span>
                      <span className="text-accent">{Math.round(fontSizeRatio * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="5.0" 
                      step="0.1" 
                      value={fontSizeRatio} 
                      onChange={(e) => setFontSizeRatio(parseFloat(e.target.value))} 
                      className="w-full accent-accent animate-pulse"
                    />
                  </div>
                </div>
              )}

              {/* ── DEDICATED LOGO UPLOAD DROPZONE (SHOWN IN LOGO & BOTH MODES) ── */}
              {brandingMode !== "text" && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80 flex items-center gap-1.5">
                    Logo Branding File Upload
                  </h3>

                  {/* Clickable Drag & Drop Zone card */}
                  <div className="relative">
                    <input 
                      type="file" 
                      id="branding-logo-upload" 
                      accept="image/*"
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                    
                    {!uploadedLogoUrl ? (
                      <label 
                        htmlFor="branding-logo-upload"
                        className="w-full border-2 border-dashed border-border hover:border-accent/40 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-background/50 hover:bg-accent/[0.01] group"
                      >
                        <Upload className="w-8 h-8 text-neutral-400 group-hover:text-accent transition-colors mb-2 animate-bounce" />
                        <span className="text-xs font-bold text-foreground group-hover:text-accent transition-colors">Choose Custom Logo Image</span>
                        <span className="text-[9px] text-muted mt-1 leading-relaxed">PNG, SVG, JPG or GIF formats supported</span>
                      </label>
                    ) : (
                      /* Active uploaded file info panel */
                      <div className="border border-accent/20 bg-accent/[0.03] rounded-lg p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded bg-card border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={uploadedLogoUrl} alt="Thumbnail Preview" className="object-contain w-10 h-10" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-foreground truncate max-w-[150px]">{uploadedLogoName}</h5>
                            <span className="text-[10px] text-muted flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-wider text-green-500">
                              <Check className="w-3.5 h-3.5" /> {uploadedLogoSize}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleRemoveLogo}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-[4px] transition-all"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Relative Image Scale Slider */}
                  <div className="space-y-2 pt-1.5">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-foreground/80">
                      <span>Relative Image/Logo Size</span>
                      <span className="text-accent">{Math.round(logoScale * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="5.0" 
                      step="0.1" 
                      value={logoScale} 
                      onChange={(e) => setLogoScale(parseFloat(e.target.value))} 
                      className="w-full accent-accent animate-pulse"
                    />
                    <span className="text-[9px] text-muted block leading-relaxed">
                      *Scale your uploaded brand mark or custom emblem from 50% up to 500% size!
                    </span>
                  </div>

                  <div className="flex gap-2.5 p-3.5 border border-border bg-card rounded-lg mt-2 text-[10px] text-muted leading-relaxed">
                    <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>
                      Upload any emblem or icon! The live preview sandbox automatically blends, routes, and overlays your file's borders to simulate glowing lights or wood carving in real time!
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ── TAB 3: COLORS & LIGHTS ── */}
          {activeTab === "colors" && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                {boardType === "wood" ? "Select Carving Accent Tint" : "Select Neon / LED Glow Color"}
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {GLOW_COLORS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setSelectedColor(col)}
                    className={`p-3 rounded-[4px] border text-left flex items-center gap-3 transition-all ${selectedColor.id === col.id ? 'bg-accent/[0.04] border-accent shadow-sm' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex-shrink-0 shadow-md shadow-black/20"
                      style={{ 
                        backgroundColor: col.hex,
                        boxShadow: `0 0 8px ${col.hex}`
                      }}
                    />
                    <span className="text-xs font-bold text-foreground truncate">{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: MATERIALS & SHAPES ── */}
          {activeTab === "material" && (
            <div className="space-y-6">
              
              {/* Backplate Shape */}
              {boardType !== "wood" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                    Backplate Shape
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKPLATE_SHAPES.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => setBackplateShape(shape)}
                        className={`p-3 rounded-[4px] border text-left text-xs transition-all ${backplateShape.id === shape.id ? 'bg-accent/[0.04] border-accent font-bold text-accent' : 'bg-background hover:bg-foreground/[0.02] border-border text-foreground'}`}
                      >
                        <h4 className="font-bold text-xs">{shape.name}</h4>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Backplate Material Styles */}
              {boardType !== "wood" && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                    Backplate Material Style
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {BACKPLATE_MATERIALS.map((mat) => (
                      <button
                        key={mat.id}
                        onClick={() => setBackplateMaterial(mat)}
                        className={`p-3 rounded-[4px] border text-left flex items-start gap-3 transition-all ${backplateMaterial.id === mat.id ? 'bg-accent/[0.04] border-accent shadow-sm' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                      >
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border ${backplateMaterial.id === mat.id ? 'border-accent text-accent' : 'border-border'}`}>
                          {backplateMaterial.id === mat.id && <span className="block w-2 h-2 rounded-full bg-accent m-0.5" />}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-foreground">{mat.name}</h4>
                          <p className="text-[10px] text-muted mt-0.5 truncate max-w-[220px]">{mat.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {boardType === "wood" && (
                <div className="flex gap-3 p-4 border border-accent/20 bg-accent/[0.03] rounded-lg">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <p className="text-xs text-muted leading-relaxed">
                    <strong>CNC Walnut Wood Customization:</strong> Under this category, the board is automatically configured with Solid joined Hardwood blocks and clean beveled edges to yield authentic engraved textures.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 5: MOUNTING & SIZES ── */}
          {activeTab === "mounting" && (
            <div className="space-y-6">
              
              {/* Mounting Style */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                  Mounting Hardware Style
                </h3>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {MOUNTING_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setMountingStyle(style)}
                      className={`p-3.5 rounded-[4px] border text-left flex items-start gap-3 transition-all ${mountingStyle.id === style.id ? 'bg-accent/[0.04] border-accent shadow-sm' : 'bg-background hover:bg-foreground/[0.02] border-border'}`}
                    >
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 border ${mountingStyle.id === style.id ? 'border-accent text-accent' : 'border-border'}`}>
                        {mountingStyle.id === style.id && <span className="block w-2 h-2 rounded-full bg-accent m-0.5" />}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-foreground">{style.name}</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-relaxed">{style.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical Size Dimensions */}
              <div className="space-y-3 border-t border-border pt-5">
                <h3 className="text-xs font-bold tracking-widest uppercase text-foreground/80">
                  Requested Physical Dimensions
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                      Width (Inches)
                    </label>
                    <input 
                      type="number" 
                      min="12" 
                      max="120"
                      value={widthInches} 
                      onChange={(e) => setWidthInches(Math.max(12, parseInt(e.target.value) || 12))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                      Height (Inches)
                    </label>
                    <input 
                      type="number" 
                      min="8" 
                      max="80"
                      value={heightInches} 
                      onChange={(e) => setHeightInches(Math.max(8, parseInt(e.target.value) || 8))}
                      className="w-full px-3 py-2 bg-background border border-border rounded-[4px] text-sm text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-muted block leading-relaxed mt-1">
                  *Our fabrication desk supports all standard dimensions from 12" up to 120" in width!
                </span>
              </div>
            </div>
          )}

          {/* ── SUBMIT / ORDER CTAS ── */}
          <div className="space-y-3 pt-3 border-t border-border">
            <button
              onClick={handleSendToWhatsApp}
              disabled={isCapturing}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-accent text-white text-xs font-bold tracking-widest uppercase rounded-[4px] hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-accent/20 ${
                isCapturing ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isCapturing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Mockup...
                </>
              ) : (
                <>
                  <svg 
                    className="w-4 h-4 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Design Mockup (PNG)
                </>
              )}
            </button>
            <span className="text-[10px] text-muted text-center block leading-relaxed px-2">
              Our live canvas sandbox will instantly bundle and export a high-resolution shaded transparent blueprint mockup of your exact signboard configuration to your local device downloads folder.
            </span>
            
            {/* Direct Helpline Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-bold text-muted uppercase tracking-wider bg-card/35 border border-border/40 p-2.5 rounded mt-2">
              <span>Fabrication Inquiry: <a href="https://wa.me/9779706247439" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">+977 9706247439</a></span>
              <span className="hidden sm:inline text-muted/30">|</span>
              <span>Helpline: <a href="https://wa.me/9779706247438" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground hover:underline">+977 9706247438</a></span>
            </div>
          </div>

        </div>

      </div>

      {/* ── HIGH FIDELITY READY FOR WHATSAPP MODAL ── */}
      {showSuccessModal && capturedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-background border border-border rounded-lg p-6 shadow-2xl space-y-5 text-center text-foreground animate-in zoom-in duration-300">
            <div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black tracking-tighter uppercase text-accent">
                Mockup Saved!
              </h3>
              <p className="text-muted text-[11px] mt-1">
                Your custom signboard blueprint has been successfully downloaded to your device.
              </p>
            </div>

            {/* Snapshot Preview Container */}
            <div className="relative border border-border/80 rounded-md overflow-hidden bg-card aspect-[16/10] shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={capturedImage} 
                alt="Your Custom Design Mockup" 
                className="w-full h-full object-contain p-2"
              />
            </div>

            {/* Specification Receipt Grid */}
            <div className="text-left space-y-2 bg-card/65 p-4 border border-border/60 rounded-lg">
              <h4 className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2.5 pb-1 border-b border-border/50 flex items-center justify-between">
                <span>Design Specifications</span>
                <span className="text-muted">Saved PNG</span>
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] leading-relaxed">
                <div>
                  <span className="text-muted block text-[9px] uppercase tracking-wider">Signboard Category</span>
                  <span className="font-bold text-foreground">
                    {boardType === "neon" && "Neon Light Signboard"}
                    {boardType === "wood" && "CNC Engraved Hardwood"}
                    {boardType === "acrylic3d" && "3D Extruded Acrylic"}
                    {boardType === "backlit" && "Halo Backlit LED"}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[9px] uppercase tracking-wider">Glow tint Hue</span>
                  <span className="font-bold text-foreground">{selectedColor.name}</span>
                </div>
                <div>
                  <span className="text-muted block text-[9px] uppercase tracking-wider">Custom branding</span>
                  <span className="font-bold text-foreground truncate max-w-[150px]">
                    {brandingMode === "text" && `Text ("${text || ""}")`}
                    {brandingMode === "logo" && "Custom Emblem"}
                    {brandingMode === "both" && `Text & Logo`}
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[9px] uppercase tracking-wider">Mockup Dimensions</span>
                  <span className="font-bold text-foreground">{widthInches}" W x {heightInches}" H</span>
                </div>
              </div>
            </div>

            {/* Modal CTA buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  handleRedirectToWhatsApp();
                  setShowSuccessModal(false);
                }}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                Chat & Submit Design on WhatsApp
              </button>
              
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-accent hover:bg-accent/90 text-white text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all shadow-lg shadow-accent/20"
              >
                <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                Add Custom Design to Cart
              </button>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-foreground text-xs font-bold tracking-widest uppercase rounded-[4px] transition-all"
              >
                Close & Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
