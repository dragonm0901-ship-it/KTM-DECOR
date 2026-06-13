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
  "Double Sided Round Light Board"
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
  "Double Sided Round Light Board": ["Projecting Bracket Sign", "LED Rotating Box", "Vintage Flange Sign", "Urban Under-Canopy"]
};

// Technical specs template per category
const TECHNICAL_SPECS: Record<string, string[]> = {
  "Acrylic Backlit Signage": [
    "High-efficiency 12V backlighting LED strips",
    "Sleek premium 8mm frosted cast acrylic faceplate",
    "Heavy-duty aluminum backing panel for structural support",
    "Standoff wall mounts & hardware fixtures included",
    "Even diffusion layout prevents shadows or hot-spots",
    "Over 45,000 hours estimated LED operational lifespan"
  ],
  "Neon Sign": [
    "Heavy-duty low-voltage 12V silicon flex neon tubing",
    "Contoured high-clarity 6mm transparent acrylic backing",
    "Complete hanging wire setup & standoff mounting screws",
    "Includes quiet solid-state 12V 5A power transformer",
    "Safe to touch, low heat, absolutely hum-free operation",
    "Flexible design adapts to any wall hanging structure"
  ],
  "3D Signage": [
    "Heavy-duty 304 marine-grade anti-corrosive steel returns",
    "Solid 20mm depth spacer pegs for floating shadow relief",
    "Fully waterproof internal IP67 light modules",
    "Precision waterjet-cut acrylic faceplate overlays",
    "Direct-mount drilling guides for seamless setup",
    "10-Year structural material warranty guarantee"
  ],
  "2D Board": [
    "Durable commercial-grade ACP (Aluminum Composite Panel) backing",
    "UV-resistant outdoor protective matte laminate wrap",
    "Clean-cut router beveled borders for modern presentation",
    "Pre-drilled heavy-load wall bracket screw eyelets",
    "Resistant to high winds, heavy rain, and direct sunlight",
    "Easy-wipe surface compatible with standard cleaning sprays"
  ],
  "House/Office Nameplate": [
    "Laser-engraved polished solid brass or wood inserts",
    "Float-mount polished edge glass spacer panel sets",
    "Invisible rear mounting stud brackets with anchor screws",
    "UV-sealed weatherproofing coating prevents tarnish/fade",
    "Fits executive desk or outdoor brick wall mounting layouts",
    "Beautiful gift packaging container included"
  ],
  "Wooden Signage": [
    "Sustainably sourced premium walnut/oak wood blocks base",
    "Precision CNC router deep engraving lines",
    "Eco-friendly outdoor Danish oil moisture-proof finish",
    "Integrated mounting hardware slots on rear panel",
    "Natural woodgrain textures make every unit unique",
    "Solid heavy-feel craftsmanship by master Nepalese artisans"
  ],
  "2.5D Signage": [
    "Multi-layered laser-cut 3mm acrylic sheet panels",
    "Textured relief CNC milling background finishes",
    "Hand-assembled layered composite construction",
    "Provides elegant dimensional depth profile details",
    "Pre-applied industrial strength double-sided mounting adhesive",
    "Spectacular visual changes under shifting ceiling lights"
  ],
  "Acrylic Table Lamp": [
    "Laser-etched high-clarity 4mm acrylic graphic slide",
    "Solid organic beechwood circular glowing light base",
    "Multi-mode warm & cool white LED emitters",
    "USB-powered layout with convenient inline switch control",
    "Ultra-low power draw (under 3.5 Watts total)",
    "Creates a mesmerizing glowing wireframe optical illusion"
  ],
  "3D Number Plate": [
    "Embossed vacuum-formed acrylic block digits",
    "Premium laser-cut carbon fiber weave backing board",
    "Fully government-compliant size and font specifications",
    "Heavy-duty waterproof double-sided foam mounting tape",
    "Reflective high-visibility backing plate for night safety",
    "Impact-resistant composite shield avoids chipping"
  ],
  "Double Sided Round Light Board": [
    "Heavy-duty rustproof circular iron outer frame casing",
    "Dual-sided high-opacity opal acrylic glowing panels",
    "Extended steel projection arm brackets for wall mounting",
    "Intense uniform internal daylight LED light array",
    "Direct-wire AC 220V connection block ready",
    "IP65 Certified fully dustproof and waterproof shell"
  ]
};

const BASE_DESCRIPTIONS: Record<string, string> = {
  "Acrylic Backlit Signage": "Transform your business front or reception desk with our premium backlit signage. Handcrafted from heavy cast acrylic and fitted with high-intensity uniform LED panels to offer a glowing architectural silhouette that commands attention.",
  "Neon Sign": "Bring vibrant color and modern aesthetic energy to any room or commercial bar with our hand-bent glowing neon signs. Mounted on contoured clear acrylic backings, these low-voltage LED tubes run perfectly cold and completely silent.",
  "3D Signage": "Add physical depth and structural branding authority with our heavy-duty fabricated 3D lettering signs. Combining stainless steel and block acrylic elements, these signs cast beautiful drop-shadows on corporate reception backdrops.",
  "2D Board": "Clean, highly visible, and built to withstand the elements, our flat e-commerce 2D boards are ideal for retail pricing menus, company directional indexes, and regulatory safety displays. Features crisp beveled edges.",
  "House/Office Nameplate": "Welcome guests or designate your workspace in premium style with our elegant custom nameplates. Blending natural wood inserts, glass frames, and polished brass plates for a timeless, executive presentation.",
  "Wooden Signage": "Bring natural warmth and artisanal character to your brand with our CNC-carved solid timber signs. Sanded to a smooth furniture finish and treated with weatherproofing oils, these pieces showcase gorgeous, unique wood grains.",
  "2.5D Signage": "A stunning cross between fine sculpture and modern signage, our 2.5D layered signs utilize overlapping panels and relief textures to create a spectacular physical depth layout that changes with ambient light angles.",
  "Acrylic Table Lamp": "Light up your workspace or bedside table with our mesmerizing 3D-optical illusion acrylic lamps. Features a solid wood base with glowing warm LEDs that shine through a custom laser-etched pattern overlay.",
  "3D Number Plate": "Stand out on the road or define your home address with our high-contrast 3D number plates. Fabricated with raised bold numbers on carbon fiber templates to ensure durability, high visibility, and luxury styles.",
  "Double Sided Round Light Board": "Ensure maximum foot-traffic views from both street directions with our heavy-duty projecting round light boxes. Built with waterproof metal frames and double-sided glowing acrylic faces to shine brightly through night storms."
};

// Generate exactly 12 premium products for clean showcase
const generateProducts = (): Product[] => {
  const products: Product[] = [];

  // Filter out "All" category
  const activeCats = CATEGORIES.filter(c => c !== "All");

  for (let i = 0; i < 12; i++) {
    const cat = activeCats[i % activeCats.length];
    const subCats = SUB_CATEGORIES[cat] || ["Standard"];
    const subCategory = subCats[i % subCats.length];
    const baseDesc = BASE_DESCRIPTIONS[cat] || "Premium custom signage hand-built to order by KTM DECOR.";
    const baseSpecs = TECHNICAL_SPECS[cat] || ["Premium construction material", "High durability finish"];
    
    // Distribute prices deterministically between Rs. 15,000 and Rs. 95,000
    const priceFactor = ((i * 7 + cat.length * 3) % 17) + 1;
    const price = Math.round((15000 + priceFactor * 4500) / 500) * 500;

    let stockStatus: Product["stockStatus"] = "In Stock";
    if (i % 5 === 0) {
      stockStatus = "Low Stock";
    } else if (i % 7 === 0) {
      stockStatus = "Custom Order Only";
    }

    let badge: string | undefined = undefined;
    if (i === 0 || i === 4) badge = "Best Seller";
    else if (i === 1 || i === 8) badge = "New";
    else if (stockStatus === "Custom Order Only") badge = "Custom";

    const name = `${cat} Premium Design #${i + 1}`;
    const description = `${baseDesc} This premium sign is custom engineered for ${subCategory.toLowerCase()} spaces. Built using heavy-duty materials with elegant finishes that deliver a premium, high-end architectural appeal. Custom options and sizing adjustments are available upon request.`;

    const specs = [
      ...baseSpecs,
      `Optimized dimensions for ${subCategory.toLowerCase()} applications`,
      `Direct delivery and professional mounting available inside Kathmandu Valley`
    ];

    products.push({
      id: (i + 1).toString(),
      name,
      category: cat,
      subCategory,
      price,
      image: `/images/placeholder.svg`,
      badge,
      description,
      specs,
      stockStatus
    });
  }

  return products;
};

export const PRODUCTS = generateProducts();
