export interface CatalogFeature {
  title: string;
  description: string;
  icon: "leaf" | "sun" | "wrench" | "diamond" | "shield" | "sparkles" | "palette" | "settings" | "ruler" | "gift" | "clock" | "eye" | "infinity";
}

export interface CatalogDetails {
  titleWhite1: string;
  titleGold: string;
  titleWhite2?: string;
  description: string;
  startingPrice: string;
  priceNote: string;
  customDesignNote: string;
  features: CatalogFeature[];
  specsTable: Record<string, string>;
  idealFor: {
    label: string;
    icon: "house" | "monitor" | "coffee" | "gift" | "camera" | "bag" | "settings" | "heart" | "truck" | "cloud" | "bed";
  }[];
  quote: string;
}

export const CATALOG_DETAILS: Record<string, CatalogDetails> = {
  // 1. Wooden Signage
  "1": {
    titleWhite1: "PREMIUM CUSTOM",
    titleGold: "WOODEN",
    titleWhite2: "SIGNAGE",
    description: "Add warmth, charm and a natural touch to your brand with our Wooden Signage. Crafted from high-quality Saal Wood with precision finishing, these signs are perfect for creating a premium, earthy and timeless impression.",
    startingPrice: "Rs. 2000 / SQ.FT.",
    priceNote: "Price varies according to size, design and material.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: [
      {
        title: "NATURAL & PREMIUM LOOK",
        description: "Crafted from high-quality Saal Wood with fine finishing for a rich and elegant natural appeal.",
        icon: "leaf"
      },
      {
        title: "DURABLE & LONG LASTING",
        description: "Strong and sturdy wood built to withstand time and daily wear & tear.",
        icon: "sun"
      },
      {
        title: "CUSTOM MADE",
        description: "Fully customizable in shape, size, engraving, color and finish to match your brand identity.",
        icon: "wrench"
      }
    ],
    specsTable: {
      "Material": "Saal Wood",
      "Finish": "Matte / Polish / Stain / Natural Oil",
      "Thickness": "1 - 3 Inch (According to Design)",
      "Engraving": "Laser Engraved / CNC Carved / Handcrafted",
      "Color Options": "Natural Wood / Stain / Polish / Custom Colors",
      "Installation": "Wall Mounted / Hanging / Stand Mounted",
      "Lifespan": "10+ Years"
    },
    idealFor: [
      { label: "SHOPS & BOUTIQUES", icon: "bag" },
      { label: "CAFÉS & RESTAURANTS", icon: "coffee" },
      { label: "RESORTS & HOMESTAYS", icon: "house" },
      { label: "OFFICES & STUDIOS", icon: "monitor" },
      { label: "FARMS & ESTATES", icon: "cloud" }
    ],
    quote: "WOODEN SIGNAGE BRINGS NATURE CLOSER TO YOUR BRAND AND CREATES A WARM, WELCOMING & MEMORABLE IMPRESSION."
  },

  // 2. Acrylic Backlit Signage
  "2": {
    titleWhite1: "ACRYLIC",
    titleGold: "BACKLIT",
    titleWhite2: "SIGNAGE",
    description: "Illuminate your brand with our Acrylic Backlit Signage. The perfect combination of premium acrylic and LED backlighting that creates a stunning halo glow, ensuring high visibility and a premium look, day and night.",
    startingPrice: "Rs. 1500 / SQ.FT.",
    priceNote: "Price varies according to size, design and material.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: [
      {
        title: "PREMIUM & ELEGANT",
        description: "High-quality acrylic with uniform LED backlight for a premium glow.",
        icon: "diamond"
      },
      {
        title: "BRIGHT & EYE-CATCHING",
        description: "Soft halo lighting that enhances visibility and creates impact.",
        icon: "sun"
      },
      {
        title: "CUSTOM MADE",
        description: "Tailored to your brand, logo and design requirements.",
        icon: "wrench"
      }
    ],
    specsTable: {
      "Material": "Acrylic (Premium Quality)",
      "Finish": "Glossy / Matte",
      "Thickness": "5mm - 10mm (As per design)",
      "Lighting": "LED Backlit (Warm / White)",
      "Color Options": "All Colors Available",
      "Installation": "Wall Mounted (With Spacer)",
      "Lifespan": "5 - 7+ Years"
    },
    idealFor: [
      { label: "OFFICES & CORPORATES", icon: "monitor" },
      { label: "RETAIL STORES & SHOWROOMS", icon: "bag" },
      { label: "CLINICS & HOSPITALS", icon: "heart" },
      { label: "CAFES & RESTAURANTS", icon: "coffee" }
    ],
    quote: "ACRYLIC BACKLIT SIGNAGE ADDS A SOPHISTICATED LOOK TO YOUR SPACE AND MAKES YOUR BRAND SHINE BRIGHT."
  },

  // 3. 2.5D Signage
  "3": {
    titleWhite1: "2.5D LAYERED",
    titleGold: "SIGNAGE",
    description: "Make a lasting impression with our 2.5D Signage - the perfect blend of depth, dimension & style. Ideal for offices, shops, showrooms, clinics and corporate spaces that stand out with elegance.",
    startingPrice: "Rs. 2000 / SQ.FT.",
    priceNote: "Price varies according to size, design and material.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: [
      {
        title: "PREMIUM LOOK & FEEL",
        description: "Layered design creates a rich 3D effect with a premium finish.",
        icon: "diamond"
      },
      {
        title: "DURABLE & LONG LASTING",
        description: "High-quality materials built to withstand time and environment.",
        icon: "sun"
      },
      {
        title: "PERFECT FOR EVERY SPACE",
        description: "Ideal for indoor branding in offices, retail stores, clinics & more.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Acrylic / ACP",
      "Finish": "Matte / Glossy / Metallic",
      "Thickness": "10mm - 25mm (As per design)",
      "Color Options": "All Colors Available",
      "Installation": "Wall Mounted",
      "Lifespan": "5 - 7+ Years"
    },
    idealFor: [
      { label: "OFFICES & CORPORATES", icon: "monitor" },
      { label: "RETAIL STORES & SHOWROOMS", icon: "bag" },
      { label: "CLINICS & HOSPITALS", icon: "heart" },
      { label: "CAFES & RESTAURANTS", icon: "coffee" }
    ],
    quote: "2.5D SIGNAGE GIVES DEPTH, STYLE & PROFESSIONAL APPEARANCE THAT ELEVATES YOUR BRAND IDENTITY."
  },

  // 4. Double Sided Round Light Board
  "4": {
    titleWhite1: "DOUBLE SIDED",
    titleGold: "ROUND",
    titleWhite2: "LIGHT BOARD",
    description: "Stand out day and night with our double sided round light boards. Perfect for shops, cafes, restaurants, salons and businesses that want maximum visibility from both directions.",
    startingPrice: "Rs. 5500 / 18 INCH",
    priceNote: "Price varies according to design and material.",
    customDesignNote: "Starting From Rs. 7500 for 24 INCH Size",
    features: [
      {
        title: "MAXIMUM VISIBILITY",
        description: "Double sided illumination for visibility from both directions.",
        icon: "eye"
      },
      {
        title: "BRIGHT & EYE-CATCHING",
        description: "Energy-efficient LED for bright, uniform and long-lasting glow.",
        icon: "sun"
      },
      {
        title: "DURABLE & WEATHERPROOF",
        description: "Built to withstand all weather conditions for long-term use.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Acrylic Face + Aluminium Body",
      "Lighting": "LED Module (Inside)",
      "Color Options": "All Colors Available",
      "Power": "12V LED (Low Power Consumption)",
      "Lifespan": "50,000+ Hours",
      "Installation": "Wall Mounted (With Bracket)"
    },
    idealFor: [
      { label: "INDOOR SHOPS & CAFES", icon: "house" },
      { label: "OUTDOOR WEATHERPROOF USE", icon: "cloud" }
    ],
    quote: "DOUBLE SIDED ROUND LIGHT BOARDS OFFER EXCELLENT 360-DEGREE VISIBILITY AND STYLISH STREET PRESENTATION."
  },

  // 5. Neon Sign
  "5": {
    titleWhite1: "CUSTOM LED",
    titleGold: "NEON",
    titleWhite2: "SIGNS",
    description: "Brighten your space with our custom LED Neon Signs. Perfect for businesses, events, cafes, homes and more. Eye-catching, energy-efficient and made to last.",
    startingPrice: "Rs. 1600 / SQ.FT.",
    priceNote: "Price varies according to design and size.",
    customDesignNote: "Custom Designs Made For You - Your Idea, Our Neon Magic!",
    features: [
      {
        title: "PREMIUM QUALITY",
        description: "High-quality LED neon flex for a smooth & vibrant glow.",
        icon: "diamond"
      },
      {
        title: "VIBRANT & EYE-CATCHING",
        description: "Bright, uniform lighting that brings your ideas to life.",
        icon: "sun"
      },
      {
        title: "DURABLE & SAFE",
        description: "Low voltage, energy-efficient, heat-free & long-lasting.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "LED Neon Flex (Silicone)",
      "Lighting": "360° Neon Glow",
      "Color Options": "Multiple Colors Available",
      "Power": "12V LED (Low Power Consumption)",
      "Lifespan": "50,000+ Hours",
      "Installation": "Wall Mounted (Indoor)"
    },
    idealFor: [
      { label: "CAFES & RESTAURANTS", icon: "coffee" },
      { label: "EVENTS & BEDROOMS", icon: "bed" },
      { label: "STUDIOS & OFFICES", icon: "monitor" }
    ],
    quote: "NEON SIGNS ADD A VIBRANT GLOW, INSTANT ENERGY, AND A CONTEMPORARY ARTISTIC FEEL TO ANY INTERIOR."
  },

  // 6. 2D Board
  "6": {
    titleWhite1: "MODERN",
    titleGold: "2D LED",
    titleWhite2: "SIGNAGE",
    description: "Sleek, stylish & affordable 2D LED Signage designed to make your brand stand out. Perfect for all types of businesses, inside or outside.",
    startingPrice: "Rs. 1000 / SQ.FT.",
    priceNote: "Price varies according to size and material.",
    customDesignNote: "Starting From Rs. 1500 / SQ.FT. for Small Size Boards",
    features: [
      {
        title: "PREMIUM QUALITY",
        description: "High-grade acrylic with LED for perfect finishing.",
        icon: "diamond"
      },
      {
        title: "LED ILLUMINATION",
        description: "Energy-efficient LED for brighter & long-lasting glow.",
        icon: "sun"
      },
      {
        title: "DURABLE & RELIABLE",
        description: "Weatherproof, rustproof & built for long-term use.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Acrylic (LED Cut Letters / Flat Cut)",
      "Lighting Options": "Front Glow",
      "Color Options": "All Colors Available",
      "Power": "12V LED (Low Power Consumption)",
      "Lifespan": "50,000+ Hours",
      "Installation": "Wall Mounted"
    },
    idealFor: [
      { label: "OFFICES & CORPORATES", icon: "monitor" },
      { label: "RETAIL STORES & SHOWROOMS", icon: "bag" },
      { label: "CLINICS & HOSPITALS", icon: "heart" },
      { label: "CAFES & RESTAURANTS", icon: "coffee" }
    ],
    quote: "2D LED SIGNAGE IS THE PERFECT BLEND OF MODERN SIMPLICITY, CRISP READABILITY, AND BUDGET-FRIENDLY ILLUMINATION."
  },

  // 7. 3D Signage
  "7": {
    titleWhite1: "PREMIUM",
    titleGold: "3D LETTER",
    titleWhite2: "SIGNAGE",
    description: "Premium 3D Letter Signs crafted with high-quality materials and LED illumination to give your brand a powerful, professional and long-lasting impression.",
    startingPrice: "NPR 180 / INCH",
    priceNote: "Price may vary based on size, material, lighting type & installation.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: [
      {
        title: "PREMIUM QUALITY",
        description: "High-grade acrylic & aluminium with perfect finishing.",
        icon: "diamond"
      },
      {
        title: "LED ILLUMINATION",
        description: "Energy-efficient LED for brighter & long-lasting glow.",
        icon: "sun"
      },
      {
        title: "DURABLE & RELIABLE",
        description: "Weatherproof, rustproof & built for long-term use.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Acrylic / Aluminium",
      "Lighting Options": "Front Glow, Side Glow, Backlit",
      "Color Options": "All Colors Available",
      "Power": "12V LED (Low Power Consumption)",
      "Lifespan": "50,000+ Hours",
      "Installation": "Wall Mounted"
    },
    idealFor: [
      { label: "OFFICES & CORPORATES", icon: "monitor" },
      { label: "RETAIL STORES & SHOWROOMS", icon: "bag" },
      { label: "CLINICS & HOSPITALS", icon: "heart" },
      { label: "CAFES & RESTAURANTS", icon: "coffee" }
    ],
    quote: "3D LETTER SIGNAGE PROVIDES AN AUTHORITATIVE, PROFESSIONAL ARCHITECTURAL DEPTH AND SLEEK LIGHTING FOR ENTERPRISES."
  },

  // 8. Laser & CNC Products
  "8": {
    titleWhite1: "ALL TYPES OF",
    titleGold: "LASER & CNC",
    titleWhite2: "PRODUCTS",
    description: "We design, cut and craft a wide range of Laser & CNC products with precision and perfection. From simple to complex, we bring your ideas to life with our advanced machinery and skilled craftsmanship.",
    startingPrice: "Rs. DEMAND BASED",
    priceNote: "Prices depend on size, complexity, and type of material.",
    customDesignNote: "Custom Made. Made For You. You Imagine, We Create.",
    features: [
      {
        title: "PRECISION LASER CUTTING",
        description: "High precision cutting & engraving on various materials with clean & smooth finish.",
        icon: "sparkles"
      },
      {
        title: "INHOUSE CUSTOMIZATION",
        description: "Fully customized as per your design, size, shape, logo and requirements.",
        icon: "settings"
      },
      {
        title: "WIDE RANGE OF MATERIALS",
        description: "Acrylic, Wood, MDF, ACP, Plywood, Metal, Fabric, Leather, Paper and more.",
        icon: "palette"
      },
      {
        title: "PREMIUM QUALITY",
        description: "Durable materials and fine finishing for long lasting performance.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Acrylic, Wood, MDF, Plywood, ACP, Metal, Leather, Paper",
      "Finish": "Precision Laser Cut & Engraved",
      "Thickness": "Variable as per project requirements",
      "Color Options": "Natural Materials / Acrylic Colors / Custom Finishes",
      "Installation": "N/A or Custom Mounting",
      "Lifespan": "Highly Durable"
    },
    idealFor: [
      { label: "HOMES", icon: "house" },
      { label: "OFFICES", icon: "monitor" },
      { label: "SHOPS & BUSINESSES", icon: "bag" },
      { label: "EVENTS & EXHIBITIONS", icon: "camera" },
      { label: "GIFTS & SOUVENIRS", icon: "gift" }
    ],
    quote: "CNC AND LASER CUTTING TECHNOLOGY ALLOWS UNLIMITED CREATIVE FREEDOM FOR PERSONAL ACCENTS AND INDUSTRIAL PARTS."
  },

  // 9. Customized Wall Clock
  "9": {
    titleWhite1: "BESPOKE CUSTOMIZED",
    titleGold: "WALL CLOCK",
    description: "Add elegance and personality to your space with our Customized Wooden, Acrylic and Resin Wall Clocks. Perfect for homes, offices, cafes, hotels and corporate gifting.",
    startingPrice: "Rs. 3000 / PIECE",
    priceNote: "Price depends on size, material type, complexity, and customization.",
    customDesignNote: "Timepieces That Reflect Your Style - Custom Made.",
    features: [
      {
        title: "CUSTOM MADE FOR YOU",
        description: "Fully customized designs, shapes, logos and themes as per your requirements.",
        icon: "palette"
      },
      {
        title: "PREMIUM MATERIALS",
        description: "High quality wood, acrylic and resin for a luxurious and long lasting finish.",
        icon: "sparkles"
      },
      {
        title: "SILENT QUARTZ MOVEMENT",
        description: "Smooth, silent and accurate movement for a peaceful environment.",
        icon: "settings"
      },
      {
        title: "DURABLE & RELIABLE",
        description: "Built to last with strong materials and fine craftsmanship.",
        icon: "shield"
      }
    ],
    specsTable: {
      "Material": "Wood, Acrylic, Resin",
      "Base": "Premium quality MDF / Plywood",
      "Resin": "Crystal clear epoxy resin with artistic finishes",
      "Movement": "Silent-sweep quartz movement mechanisms",
      "Color Options": "Natural Wood / Custom Colors / Ocean Wave Textures",
      "Lifespan": "Long-term Durability",
      "Backlight": "LED Ring Accent (Optional)"
    },
    idealFor: [
      { label: "HOMES & BEDROOMS", icon: "house" },
      { label: "OFFICES & WORKSPACES", icon: "monitor" },
      { label: "CAFES & RESTAURANTS", icon: "coffee" },
      { label: "HOTELS", icon: "bed" },
      { label: "CORPORATE GIFTING", icon: "gift" }
    ],
    quote: "CUSTOMIZED CLOCKS ARE TIMELY WORKS OF ART THAT MERGE SILENT PRECISION MOVEMENT WITH STYLISH PERSONALIZATION."
  },

  // 10. 3D Number Plate
  "10": {
    titleWhite1: "3D VEHICLE",
    titleGold: "NUMBER PLATE",
    description: "Upgrade your vehicle's style with our 3D Number Plates made from high-quality acrylic letters on ACP board. Designed for a sleek, modern and premium look that stands out on the road.",
    startingPrice: "Rs. 1200 / TWO WHEELER",
    priceNote: "Price depends on size, design & customization.",
    customDesignNote: "Premium Look. Strong Impact. Starting Rs. 2500 for Four Wheeler.",
    features: [
      {
        title: "PREMIUM 3D LOOK",
        description: "High-quality acrylic letters give a bold and classy 3D appearance.",
        icon: "diamond"
      },
      {
        title: "STRONG & DURABLE",
        description: "Weather resistant, rust proof and built to last in all conditions.",
        icon: "shield"
      },
      {
        title: "FADE & WEATHER PROOF",
        description: "Designed to withstand sun, rain, dust and everyday wear.",
        icon: "sun"
      },
      {
        title: "PRECISION LASER CUT",
        description: "CNC / Laser cut for perfect finishing and accuracy.",
        icon: "ruler"
      }
    ],
    specsTable: {
      "Base Material": "ACP Board (Aluminium Composite Panel)",
      "Letters": "Acrylic (3D Cutout Letters)",
      "Thickness": "ACP: 3 mm | Acrylic: 3 mm",
      "Finish": "Glossy / Matte",
      "Cutting": "CNC / Laser Cut",
      "Color Options": "Black, White & Custom Colors",
      "Installation": "Easy Mounting (No Screws Needed)",
      "Lifespan": "Lifetime"
    },
    idealFor: [
      { label: "TWO WHEELERS", icon: "settings" },
      { label: "FOUR WHEELERS", icon: "truck" },
      { label: "COMMERCIAL VEHICLES", icon: "truck" },
      { label: "FLEET OWNERS", icon: "truck" }
    ],
    quote: "3D VEHICLE NUMBER PLATES BRING MODERN ELEGANCE AND SHARP COMPLIANT LEGIBILITY TO YOUR AUTOMOBILE."
  },

  // 11. House/Office Nameplate
  "11": {
    titleWhite1: "CUSTOMIZED HOME / OFFICE",
    titleGold: "NAMEPLATE",
    description: "Make a lasting first impression with our customized Acrylic & ACP Nameplates. Perfect for homes, offices, hotels and business spaces, these nameplates add a touch of class and professionalism to your entrance.",
    startingPrice: "Rs. 2000 / 1 FEET",
    priceNote: "Price depends on size, design and material customization.",
    customDesignNote: "Elegant. Durable. Distinctly Yours.",
    features: [
      {
        title: "PREMIUM & STYLISH",
        description: "High-quality acrylic & ACP with beautiful finishes for a classy look.",
        icon: "palette"
      },
      {
        title: "FULLY CUSTOMIZED",
        description: "Customize name, number, logo, fonts, colors and sizes as per your requirement.",
        icon: "wrench"
      },
      {
        title: "WEATHER RESISTANT",
        description: "Designed to withstand sun, rain and everyday wear for long life.",
        icon: "shield"
      },
      {
        title: "EASY INSTALLATION",
        description: "Comes with strong Screws for easy and firm mounting.",
        icon: "settings"
      }
    ],
    specsTable: {
      "Material": "Acrylic / ACP Board",
      "Thickness": "Acrylic: 3 mm - 5 mm | ACP: 3 mm",
      "Finish": "Glossy / Matte / Textured / Wooden / Metallic",
      "Engraving": "CNC / Laser Cut",
      "Color Options": "Wide range of colors & textures",
      "Installation": "Screw Mounted / Standoff Mounted",
      "Lifespan": "Lifetime"
    },
    idealFor: [
      { label: "HOMES & APARTMENTS", icon: "house" },
      { label: "OFFICES & WORKSPACES", icon: "monitor" },
      { label: "HOTELS & RESORTS", icon: "bed" },
      { label: "SHOPS & BUSINESSES", icon: "bag" },
      { label: "CLINICS & INSTITUTES", icon: "heart" }
    ],
    quote: "CUSTOMIZED NAMEPLATES ADD IDENTITY, PROFESSIONALISM AND STYLE TO YOUR SPACE."
  },

  // 12. Acrylic Table Lamp
  "12": {
    titleWhite1: "CUSTOMIZED",
    titleGold: "ACRYLIC",
    titleWhite2: "TABLE LAMP",
    description: "Light up your space with our Customized Acrylic Table Lamps. Perfect for homes, offices, cafes, studios and gifting - these lamps add a unique touch to your brand, name or special moments.",
    startingPrice: "Rs. 1800 / PIECE",
    priceNote: "Price varies according to size, design and customization.",
    customDesignNote: "Custom Design Your Text, Logo or Artwork",
    features: [
      {
        title: "PREMIUM & STYLISH",
        description: "High-quality acrylic with brilliant LED lighting for an elegant glow.",
        icon: "diamond"
      },
      {
        title: "FULLY CUSTOMIZED",
        description: "Add your name, logo, design or text to make it truly unique.",
        icon: "wrench"
      },
      {
        title: "SAFE & DURABLE",
        description: "Energy-efficient LED, low heat and long-lasting performance.",
        icon: "shield"
      },
      {
        title: "PERFECT FOR ANY SPACE",
        description: "Ideal for bedrooms, work desks, cafes, studios and special gifts.",
        icon: "gift"
      }
    ],
    specsTable: {
      "Material": "Premium Acrylic",
      "Base": "Wood or Acrylic",
      "Light": "LED (Warm White)",
      "Power": "12V DC Power",
      "Thickness": "3 mm - 4 mm Acrylic",
      "Color Options": "Clear / Frosted (On Request)",
      "Customization": "Name, Logo, Text, Artwork",
      "Lifespan": "30,000+ Hours"
    },
    idealFor: [
      { label: "HOMES & BEDROOMS", icon: "house" },
      { label: "OFFICES & WORKSPACES", icon: "monitor" },
      { label: "CAFÉS & RESTAURANTS", icon: "coffee" },
      { label: "GIFTING & OCCASIONS", icon: "gift" },
      { label: "STUDIOS & EVENTS", icon: "camera" }
    ],
    quote: "CUSTOMIZED ACRYLIC TABLE LAMPS ADD A SOFT GLOW AND A PERSONAL TOUCH TO EVERY SPACE."
  }
};
