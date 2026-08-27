export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  image: string;
  badge?: string;
  description: string;
  specs: string[];
  stockStatus: "In Stock" | "Low Stock" | "Custom Order Only";
  dimensions?: string;
  rating?: number;
  reviewsCount?: number;
  image_urls?: string[];
  variants?: {
    option_name: string;
    price: number;
    compare_at_price?: number;
  }[];
  long_description?: string;
}

export const CATEGORIES = [
  "All",
  "Acrylic Backlit Signage",
  "Neon Sign",
  "3D Signage",
  "2D Board",
  "House/Office Nameplate",
  "Wooden Signage",
  "2.5D Signage",
  "Acrylic Table Lamp",
  "3D Number Plate",
  "Double Sided Round Light Board",
  "Laser & CNC Products",
  "Customized Wall Clock"
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  "Acrylic Backlit Signage": ["Lobby & Reception", "Corporate Office", "Retail Storefront", "Luxury Showrooms"],
  "Neon Sign": ["Custom Script", "Bar & Restaurant", "Boutique & Salon", "Event Backdrop"],
  "3D Signage": ["Brushed Metal", "Glowing Halo", "Block Acrylic", "Fabricated Steel"],
  "2D Board": ["Directional & Directory", "Restaurant Menu", "Safety & Informational", "Exterior Panels"],
  "House/Office Nameplate": ["Executive Desk", "Premium Residential", "Modern Metallic", "Glass Finish"],
  "Wooden Signage": ["Laser Engraved", "Earthy Rustic Plank", "Live Edge Wood", "Wood-Acrylic Hybrid"],
  "2.5D Signage": ["Multi-Layered relief", "Textured CNC Cut", "Geometric Art Panel", "Abstract Relief"],
  "Acrylic Table Lamp": ["Branded Display Lamp", "3D Wireframe Illusion", "Bedside Glow Accent", "Minimalist Icon Lamp"],
  "3D Number Plate": ["Luxury Car Plate", "Bike Number Plate", "Villa Address Plaque", "Floating Mount Plate"],
  "Double Sided Round Light Board": ["Projecting Bracket Sign", "LED Rotating Box", "Vintage Flange Sign", "Urban Under-Canopy"],
  "Laser & CNC Products": ["Acrylic Products", "Wooden Products", "ACP Letters", "Plywood Cutouts"],
  "Customized Wall Clock": ["Resin Ocean", "Wooden Cutout", "Acrylic Mandala", "Logo Clock"]
};

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Premium Custom Wooden Signage",
    category: "Wooden Signage",
    subCategory: "Laser Engraved",
    price: 4000,
    image: "/products/product_1_main.png",
    badge: "Best Seller",
    description: "Add warmth, charm and a natural touch to your brand with our Wooden Signage. Crafted from high-quality Saal Wood with precision finishing, these signs are perfect for creating a premium, earthy and timeless impression.",
    specs: [
      "High-quality seasoned Saal Wood construction",
      "Matte, polish, stain, or natural oil finish options",
      "Thickness ranges from 1 to 3 inches according to design",
      "Laser engraved, CNC carved, or handcrafted lettering",
      "Suitable for shops, boutiques, cafes, and rustic showrooms"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 28,
    image_urls: ["/products/product_1_main.png", "/products/product_1_thumb.png"],
    variants: [
      { option_name: "2x1 feet (2 Sq.Ft.)", price: 4000, compare_at_price: 5200 },
      { option_name: "2x2 feet (4 Sq.Ft.)", price: 8000, compare_at_price: 10400 },
      { option_name: "3x2 feet (6 Sq.Ft.)", price: 12000, compare_at_price: 15600 },
      { option_name: "4x3 feet (12 Sq.Ft.)", price: 24000, compare_at_price: 31200 }
    ]
  },
  {
    id: "2",
    name: "Premium Acrylic Backlit Signage",
    category: "Acrylic Backlit Signage",
    subCategory: "Luxury Showrooms",
    price: 3000,
    image: "/products/product_2_main.png",
    badge: "New",
    description: "Illuminate your brand with our Acrylic Backlit Signage. The perfect combination of premium acrylic and LED backlighting that creates a stunning halo glow, ensuring high visibility and a premium look, day and night.",
    specs: [
      "Premium quality front and backlit cast acrylic faceplate",
      "Uniform LED backlit modules (Warm or White options)",
      "Thickness ranging from 5mm to 10mm as per design requirements",
      "Includes low-voltage 12V power transformer",
      "Designed for office receptions, retail stores, and clinics"
    ],
    stockStatus: "In Stock",
    rating: 4.8,
    reviewsCount: 19,
    image_urls: ["/products/product_2_main.png"],
    variants: [
      { option_name: "2x1 feet (2 Sq.Ft.)", price: 3000, compare_at_price: 3900 },
      { option_name: "2x2 feet (4 Sq.Ft.)", price: 6000, compare_at_price: 7800 },
      { option_name: "3x2 feet (6 Sq.Ft.)", price: 9000, compare_at_price: 11700 },
      { option_name: "4x3 feet (12 Sq.Ft.)", price: 18000, compare_at_price: 23400 }
    ]
  },
  {
    id: "3",
    name: "Premium 2.5D Layered Signage",
    category: "2.5D Signage",
    subCategory: "Corporate Office",
    price: 4000,
    image: "/products/product_3_layered_signage_v2.png",
    badge: "Custom",
    description: "Make a lasting impression with our 2.5D Signage - the perfect blend of depth, dimension and style. Layered design creates a rich 3D effect with a premium finish. Ideal for office interiors and showrooms.",
    specs: [
      "High-quality layered acrylic and ACP composite construction",
      "Thickness ranging from 10mm to 25mm for bold dimensional relief",
      "Finish options include matte, glossy, or brushed metallic",
      "Standoff spacers or flush wall mounting brackets included",
      "Perfect for corporate branding, offices, and retail lobbies"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 14,
    image_urls: ["/products/product_3_layered_signage_v2.png"],
    variants: [
      { option_name: "2x1 feet (2 Sq.Ft.)", price: 4000, compare_at_price: 5200 },
      { option_name: "2x2 feet (4 Sq.Ft.)", price: 8000, compare_at_price: 10400 },
      { option_name: "3x2 feet (6 Sq.Ft.)", price: 12000, compare_at_price: 15600 },
      { option_name: "4x3 feet (12 Sq.Ft.)", price: 24000, compare_at_price: 31200 }
    ]
  },
  {
    id: "4",
    name: "Double Sided Projecting Light Board",
    category: "Double Sided Round Light Board",
    subCategory: "Retail Storefront",
    price: 5500,
    image: "/products/product_4_main.png",
    badge: "Best Seller",
    description: "Stand out day and night with our double sided round light boards. Perfect for shops, cafes, restaurants, salons and businesses that want maximum visibility from both directions.",
    specs: [
      "Double-sided illumination with dual opal acrylic panels",
      "Heavy-duty rustproof circular iron outer frame casing",
      "High-intensity internal LED modules with uniform diffusion",
      "Low-voltage 12V power supply for high efficiency",
      "IP65 certified fully waterproof and weatherproof seal"
    ],
    stockStatus: "In Stock",
    rating: 4.8,
    reviewsCount: 32,
    image_urls: ["/products/product_4_main.png"],
    variants: [
      { option_name: "18 Inch Diameter", price: 5500, compare_at_price: 7150 },
      { option_name: "24 Inch Diameter", price: 7500, compare_at_price: 9750 }
    ]
  },
  {
    id: "5",
    name: "Custom LED Neon Sign",
    category: "Neon Sign",
    subCategory: "Custom Script",
    price: 3200,
    image: "/products/product_5_main.png",
    badge: "New",
    description: "Brighten your space with our custom LED Neon Signs. Hand-bent from low-voltage silicone flex tubing, these signs are completely silent, safe to touch, and run cold. Ideal for cafes, bedrooms, salons, and backdrop displays.",
    specs: [
      "Low-voltage 12V silicone flex neon tubing (safe to touch)",
      "High-clarity transparent acrylic backing sheet (6mm)",
      "Quiet solid-state power transformer and dimmer switch",
      "Pre-drilled holes for hanging wires or standoff mounts",
      "Over 50,000 hours estimated operational lifespan"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 45,
    image_urls: ["/products/product_5_main.png"],
    variants: [
      { option_name: "2x1 feet (2 Sq.Ft.)", price: 3200, compare_at_price: 4160 },
      { option_name: "2x2 feet (4 Sq.Ft.)", price: 6400, compare_at_price: 8320 },
      { option_name: "3x2 feet (6 Sq.Ft.)", price: 9600, compare_at_price: 12480 },
      { option_name: "4x2 feet (8 Sq.Ft.)", price: 12800, compare_at_price: 16640 }
    ]
  },
  {
    id: "6",
    name: "Modern 2D LED Signboard",
    category: "2D Board",
    subCategory: "Directional & Directory",
    price: 3375,
    image: "/products/product_6_main.png",
    description: "Sleek, stylish, and highly cost-effective, our flat 2D LED signboards feature laser-cut acrylic letters on a matte backing panel. Perfect for interior branding, reception desks, and building directory boards.",
    specs: [
      "Premium flat-cut acrylic letters on a composite panel backing",
      "Front-glowing LED strip inserts for a crisp face glow",
      "Ultra-slim profile design with beveled edges",
      "Standoff wall mounts and anchor brackets included",
      "Custom colors and brand matching options available"
    ],
    stockStatus: "In Stock",
    rating: 4.7,
    reviewsCount: 12,
    image_urls: ["/products/product_6_main.png"],
    variants: [
      { option_name: "Small (1.5x1.5 feet)", price: 3375, compare_at_price: 4300 },
      { option_name: "Medium (2x2 feet)", price: 6000, compare_at_price: 7800 },
      { option_name: "Big (3x3 feet)", price: 9000, compare_at_price: 11700 }
    ]
  },
  {
    id: "7",
    name: "Premium 3D Letter Signage",
    category: "3D Signage",
    subCategory: "Glowing Halo",
    price: 10800,
    image: "/products/product_7_main.png",
    badge: "Custom",
    description: "Give your brand a powerful and professional look with our premium 3D Letter Signage. Crafted with high-grade metal or thick block acrylic returns, these individual letters feature internal front, side, or backlighting for a breathtaking architectural appearance.",
    specs: [
      "Individually fabricated 3D letters from acrylic or aluminum",
      "High-intensity internal IP67 waterproof LED modules (12V)",
      "Front-glowing, side-glowing, or backlit halo light options",
      "Standoff spacers for a beautiful floating shadow depth",
      "Complete template guide for easy wall mounting installation"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 22,
    image_urls: ["/products/product_7_main.png"],
    variants: [
      { option_name: "6 Inch Letters (Set of 10)", price: 10800, compare_at_price: 14000 },
      { option_name: "8 Inch Letters (Set of 10)", price: 14400, compare_at_price: 18700 },
      { option_name: "10 Inch Letters (Set of 10)", price: 18000, compare_at_price: 23400 }
    ]
  },
  {
    id: "8",
    name: "Custom Laser & CNC Products",
    category: "Laser & CNC Products",
    subCategory: "Acrylic Products",
    price: 1200,
    image: "/products/product_8_main.png",
    description: "We design, cut, and engrave a wide range of custom gifts, trophies, keychains, organizers, and home decor items. Using state-of-the-art laser and CNC cutters, we bring your custom illustrations to life on acrylic, wood, MDF, and metals.",
    specs: [
      "High-precision laser cutting and engraving finish",
      "Materials: acrylic, solid wood, MDF, plywood, ACP, and leather",
      "Completely custom layouts based on client artwork files",
      "Premium polished edges and clean engraving lines",
      "Fast fabrication turnaround for bulk orders"
    ],
    stockStatus: "In Stock",
    rating: 4.8,
    reviewsCount: 37,
    image_urls: ["/products/product_8_main.png", "/products/product_8_thumb.png"],
    variants: [
      { option_name: "Acrylic Desk Organizer", price: 1200, compare_at_price: 1560 },
      { option_name: "Wooden Trophy & Award", price: 1500, compare_at_price: 1950 },
      { option_name: "Laser Engraved Nameplate", price: 2000, compare_at_price: 2600 },
      { option_name: "Custom Keychains (Set of 50)", price: 2500, compare_at_price: 3250 }
    ]
  },
  {
    id: "9",
    name: "Bespoke Customized Wall Clock",
    category: "Customized Wall Clock",
    subCategory: "Resin Ocean",
    price: 3000,
    image: "/products/product_9_main.png",
    description: "Add elegance and artistic personality to your walls with our Customized Wall Clocks. Blending natural wood blocks, colored acrylics, and textured epoxy resin waves, each timepiece is hand-detailed by Nepalese artisans and fitted with silent quartz sweeps.",
    specs: [
      "Premium seasoned timber blocks combined with ocean epoxy resin",
      "Silent-sweep quartz movement mechanisms (absolutely tick-free)",
      "Backlit warm LED accent lighting ring (optional)",
      "High-clarity acrylic mandala details or custom wooden cutouts",
      "Available in sizes from 12 inch to 30 inch diameter"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 42,
    image_urls: ["/products/product_9_main.png", "/products/product_9_thumb1.png", "/products/product_9_thumb2.png"],
    variants: [
      { option_name: "12 Inch Wooden Clock", price: 3000, compare_at_price: 3900 },
      { option_name: "12 Inch Acrylic Clock", price: 3500, compare_at_price: 4550 },
      { option_name: "12 Inch Resin Art Clock", price: 4500, compare_at_price: 5850 },
      { option_name: "12 Inch Wood + Resin Clock", price: 5500, compare_at_price: 7150 },
      { option_name: "16 Inch Wood + Resin Clock", price: 8000, compare_at_price: 10400 }
    ]
  },
  {
    id: "10",
    name: "3D Vehicle Number Plate",
    category: "3D Number Plate",
    subCategory: "Luxury Car Plate",
    price: 1200,
    image: "/products/product_10_main.png",
    badge: "New",
    description: "Upgrade your vehicle's aesthetic with our premium 3D Number Plates. Constructed with bold raised acrylic letters on a matte Aluminum Composite Panel (ACP) base, these plates are completely weatherproof, impact resistant, and compliant with standard styling guidelines.",
    specs: [
      "Heavy-duty anti-corrosive ACP backing board (3mm)",
      "Compliant embossed acrylic block digits (3mm thickness)",
      "Waterproof double-sided mounting adhesive (requires no drill holes)",
      "Fade-resistant finish that withstands direct Nepalese sunlight",
      "Available in white base with red letters, or red base with white letters"
    ],
    stockStatus: "In Stock",
    rating: 4.8,
    reviewsCount: 26,
    image_urls: ["/products/product_10_main.png", "/products/product_10_thumb.png"],
    variants: [
      { option_name: "Two Wheeler standard", price: 1200, compare_at_price: 1560 },
      { option_name: "Four Wheeler standard", price: 2500, compare_at_price: 3250 }
    ]
  },
  {
    id: "11",
    name: "Customized Home & Office Nameplate",
    category: "House/Office Nameplate",
    subCategory: "Premium Residential",
    price: 2000,
    image: "/images/name-plates.webp",
    description: "Welcome guests in style with our bespoke customized nameplates. We combine brushed metallic ACP backings with glossy laser-cut acrylic lettering and warm lighting options to create a sophisticated, executive presentation for your home or corporate entrance.",
    specs: [
      "Premium acrylic face panel combined with metallic ACP backing",
      "Laser-cut 3D lettering for elegant depth and visibility",
      "Standoff brass spacers and screws included for firm mounting",
      "Fully weatherproof and fade-resistant for outdoor exposure",
      "Custom religious emblems, family logos, or office designations"
    ],
    stockStatus: "In Stock",
    rating: 4.9,
    reviewsCount: 31,
    image_urls: ["/images/name-plates.webp", "/images/dimensional-ktm.webp", "/images/3d-letters-salt.webp"],
    variants: [
      { option_name: "Standard (12x6 inch)", price: 2000, compare_at_price: 2600 },
      { option_name: "Executive (16x8 inch)", price: 2800, compare_at_price: 3640 },
      { option_name: "Premium (20x10 inch)", price: 3600, compare_at_price: 4680 }
    ]
  },
  {
    id: "12",
    name: "Bespoke Acrylic Table Lamp",
    category: "Acrylic Table Lamp",
    subCategory: "Branded Display Lamp",
    price: 1800,
    image: "/images/hero-04.webp",
    description: "Add a soft ambient glow and a custom touch to your space with our Customized Acrylic Table Lamps. Built with a solid organic beechwood base and a high-clarity laser-etched acrylic plate, these lamps create beautiful line-art illusions, names, or corporate logos.",
    specs: [
      "Precision laser-etched high-clarity 4mm acrylic graphic slide",
      "Solid polished beechwood circular base with built-in LEDs",
      "Multi-mode USB powered warm white illumination with inline switch",
      "Low-voltage operation (under 3.5 Watts total) safe for bedside use",
      "Fully customizable with family names, line drawings, or logo prints"
    ],
    stockStatus: "In Stock",
    rating: 4.8,
    reviewsCount: 24,
    image_urls: ["/images/hero-04.webp", "/images/neon-taso.webp", "/images/neon-momo.webp"],
    variants: [
      { option_name: "Bedside Mini", price: 1800, compare_at_price: 2340 },
      { option_name: "Desk Standard", price: 2430, compare_at_price: 3150 },
      { option_name: "Lounge Premium", price: 3060, compare_at_price: 3980 }
    ]
  }
];
