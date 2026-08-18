export interface ServicePseoItem {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  priceStartingNpr: number;
  priceUnit: string;
  turnaroundTime: string;
  heroHeadline: string;
  description: string;
  keyBenefits: string[];
  specs: string[];
  popularUseCases: string[];
}

export interface LocationPseoItem {
  id: string;
  slug: string;
  name: string;
  district: string;
  regionType: "Kathmandu Valley Hub" | "Major Nepal City";
  deliveryTime: string;
  landmarkReference: string;
  localIntro: string;
  latitude: number;
  longitude: number;
  popularLocalBusinesses: string[];
}

export const PSEO_SERVICES: ServicePseoItem[] = [
  {
    id: "custom-neon-signs",
    slug: "custom-neon-signs",
    name: "Custom LED Neon Signs",
    shortName: "Neon Signs",
    metaTitleTemplate: "Custom LED Neon Signs in {location} | Price, Design & Delivery | KTM DECOR",
    metaDescriptionTemplate: "Looking for custom LED neon signs in {location}? Get handcrafted neon lights, cafe logos, bedroom decor, and outdoor waterproof signs with fast delivery and 1-year warranty.",
    priceStartingNpr: 2500,
    priceUnit: "per sign",
    turnaroundTime: "3 to 5 business days",
    heroHeadline: "Custom Handcrafted LED Neon Signs in",
    description: "Transform your commercial venue or private sanctuary with custom 12V low-voltage LED neon art. Designed with premium silicone tubing and 6mm cast acrylic backing for unbreakable, silent, and energy-efficient illumination.",
    keyBenefits: [
      "Low power consumption (costs under NPR 50/month in electricity)",
      "Safe 12V DC power with free adapter and hanging kit included",
      "50,000+ hour lifespan with 1-Year replacement warranty",
      "Free 3D digital design preview before production"
    ],
    specs: ["12V Low Voltage DC", "6mm Cast Acrylic", "IP67 Weatherproof Option", "Dimmer Remote Available"],
    popularUseCases: ["Instagrammable Cafe Wall Art", "Bar & Lounge Backdrops", "Bedroom Aesthetic Quotes", "Wedding & Event Photo Booths"]
  },
  {
    id: "3d-acrylic-signboards",
    slug: "3d-acrylic-signboards",
    name: "3D Acrylic & Backlit Signboards",
    shortName: "3D Signboards",
    metaTitleTemplate: "3D Acrylic Sign Board Makers in {location} | Storefront Signage Nepal",
    metaDescriptionTemplate: "Order premium 3D acrylic letter signboards and backlit halo display boards in {location}. Direct factory pricing from Balkot workshop with professional installation.",
    priceStartingNpr: 2800,
    priceUnit: "per sq. ft.",
    turnaroundTime: "5 to 8 business days",
    heroHeadline: "Architectural 3D Acrylic Letter Signboards in",
    description: "Elevate your brand presence with precision laser-cut 3D acrylic letters, brushed metal finishes, and luxurious warm halo backlighting. Built to withstand Nepal's monsoons and intense UV sunlight.",
    keyBenefits: [
      "Laser-cut precision lettering with custom brand typography",
      "Halo-backlit and front-lit LED illumination configurations",
      "Rustproof Aluminium Composite Panel (ACP) backboards",
      "Professional on-site mounting and electrical wiring across Kathmandu Valley"
    ],
    specs: ["3mm–20mm Cast Acrylic", "Waterproof Samsung LED Modules", "Heavy-Duty ACP Frame", "12V MeanWell Power Supplies"],
    popularUseCases: ["Retail Storefront Facades", "Corporate Office Receptions", "Clinic & Hospital Signs", "Shopping Mall Boutiques"]
  },
  {
    id: "led-light-boards",
    slug: "led-light-boards",
    name: "Illuminated 2D Light Boards & Projecting Boxes",
    shortName: "Light Boards",
    metaTitleTemplate: "LED Light Board & Display Board in {location} | Best Price Nepal",
    metaDescriptionTemplate: "Get double-sided round light boxes, 2D glow boards, and illuminated shop display boards in {location}. High brightness, rust-proof framing, and fast delivery.",
    priceStartingNpr: 1500,
    priceUnit: "per sq. ft.",
    turnaroundTime: "3 to 6 business days",
    heroHeadline: "Commercial LED Light Boards & Projecting Boxes in",
    description: "High-visibility, energy-saving commercial light boards. From circular double-sided projecting blades to rectangular glow panels, guarantee your storefront is visible day and night.",
    keyBenefits: [
      "Double-sided projection for maximum pedestrian eye-level visibility",
      "High brightness (5,500+ nits) for clear daytime readability",
      "Weather-sealed powder-coated aluminium outer casing",
      "Easy maintenance and bulb/strip modular replacement"
    ],
    specs: ["Extruded Aluminium Casing", "Translucent Acrylic Faceplate", "High Lumen LED Modules", "Rustproof Wall Brackets"],
    popularUseCases: ["Pedestrian Street Corner Cafes", "Pharmacy & Mart Directional Signs", "Exchange & Travel Agency Boards", "Salon & Spa Street Blade Signs"]
  },
  {
    id: "office-branding-nameplates",
    slug: "office-branding-nameplates",
    name: "Office Branding & 3D Entrance Nameplates",
    shortName: "Nameplates & Decor",
    metaTitleTemplate: "Custom Name Plate Design & Office Decor in {location} | KTM DECOR",
    metaDescriptionTemplate: "Order luxury wooden nameplates, executive desk plates, and corporate reception decor in {location}. Handcrafted with natural Saal wood, acrylic, and brass.",
    priceStartingNpr: 1200,
    priceUnit: "per piece",
    turnaroundTime: "2 to 4 business days",
    heroHeadline: "Bespoke Office Entrance Nameplates & Interior Decor in",
    description: "Make a powerful first impression with executive desk nameplates, residential villa entrance plaques, and laser-engraved wooden decor made in Nepal with seasoned timbers and metallic finishes.",
    keyBenefits: [
      "Custom laser engraving with Nepali/English scripts and corporate logos",
      "Premium materials: Solid Saal wood, brushed brass, and clear acrylic",
      "Weather-resistant polyurethane protective coatings for exterior gates",
      "Fast 48-hour mockup approval process"
    ],
    specs: ["Seasoned Natural Hardwood", "Brushed Gold / Silver ACP", "Laser Etched Typography", "Concealed Screw Mounts"],
    popularUseCases: ["Executive Director Desk Plaques", "House & Villa Gate Number Plates", "Law Firm & Clinic Reception Panels", "Corporate Recognition Awards"]
  }
];

export const PSEO_LOCATIONS: LocationPseoItem[] = [
  {
    id: "thamel",
    slug: "thamel",
    name: "Thamel, Kathmandu",
    district: "Kathmandu",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Mandala Street, Tridevi Sadak, Chaksibari & Z-Street",
    localIntro: "Thamel is the pulsating heartbeat of Kathmandu's tourism, culinary, and nightlife scenes. With hundreds of competing cafes, rooftop bars, and boutique shops, illuminated LED neon signs and vibrant 3D storefronts are essential to capture tourist foot traffic after dark.",
    latitude: 27.7154,
    longitude: 85.3123,
    popularLocalBusinesses: ["Rooftop Cocktail Lounges", "Live Music Pubs & Cafes", "Pashmina & Handicraft Boutiques", "Trekking & Adventure Agencies"]
  },
  {
    id: "jhamsikhel",
    slug: "jhamsikhel",
    name: "Jhamsikhel, Lalitpur",
    district: "Lalitpur",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Restaurant Row, Sanepa Chowk & St. Xavier's vicinity",
    localIntro: "Known as the culinary and diplomatic hub of Lalitpur, Jhamsikhel demands sophisticated aesthetic branding. High-end bistros, art cafes, and design studios here favor warm halo-backlit 3D letters and minimalist neon art.",
    latitude: 27.6782,
    longitude: 85.3115,
    popularLocalBusinesses: ["Artisanal Bakeries & Specialty Cafes", "Fine Dining Restaurants", "Boutique Design Studios", "Wellness & Yoga Sanctuaries"]
  },
  {
    id: "durbar-marg",
    slug: "durbar-marg",
    name: "Durbar Marg, Kathmandu",
    district: "Kathmandu",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "King's Way, Narayanhiti Avenue & Annapurna Arcade",
    localIntro: "Durbar Marg is Nepal's premier luxury boulevard, housing flagship international brands, 5-star hotel arcades, and top corporate headquarters that require world-class stainless steel 3D signboards and illuminated reception branding.",
    latitude: 27.7107,
    longitude: 85.3175,
    popularLocalBusinesses: ["Luxury Apparel Showrooms", "Bank Corporate HQs", "High-End Watch & Jewelry Stores", "Five-Star Hotel Lounges"]
  },
  {
    id: "balkot-bhaktapur",
    slug: "balkot-bhaktapur",
    name: "Balkot & Bhaktapur",
    district: "Bhaktapur",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "Same Day / 1 Day (Direct Factory Pickup Available)",
    landmarkReference: "KTM DECOR Fabrication Workshop, Kaushaltar, Suryabinayak & Sallaghari",
    localIntro: "As the home of the KTM DECOR central workshop in Balkot, customers across Bhaktapur, Kaushaltar, Thimi, and Lokanthali enjoy direct factory pricing, fastest production turnaround, and on-demand local consultations.",
    latitude: 27.6715,
    longitude: 85.3702,
    popularLocalBusinesses: ["Local Traditional Workshops", "Bhaktapur Heritage Cafes", "New Residential Villa Complexes", "Auto Showrooms on Araniko Highway"]
  },
  {
    id: "lazimpat",
    slug: "lazimpat",
    name: "Lazimpat & Panipokhari",
    district: "Kathmandu",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Embassy Corridor, Hotel Shangri-La area & Radisson Circle",
    localIntro: "Lazimpat is a key diplomatic and corporate hub hosting embassies, multinational corporations, and upscale residential suites requiring clean executive acrylic nameplates and polished metal branding.",
    latitude: 27.7225,
    longitude: 85.3211,
    popularLocalBusinesses: ["Embassy Consulates & NGOs", "Corporate Consulting Firms", "Boutique Heritage Hotels", "Specialty Dental & Skin Clinics"]
  },
  {
    id: "patan-lalitpur",
    slug: "patan-lalitpur",
    name: "Patan & Pulchowk",
    district: "Lalitpur",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Patan Durbar Square, Pulchowk Engineering Road & Jawalakhel Chowk",
    localIntro: "Lalitpur's historic craft capital seamlessly merges ancient Newari aesthetic sensibilities with modern startup innovation, making 3D acrylic signs and custom mood lighting popular among tech incubators and heritage cafes.",
    latitude: 27.6744,
    longitude: 85.3242,
    popularLocalBusinesses: ["Tech Startups & Co-working Spaces", "Heritage Craft Galleries", "Coffee Houses around Pulchowk", "Interior Architecture Offices"]
  },
  {
    id: "new-road",
    slug: "new-road",
    name: "New Road & Bishal Bazaar",
    district: "Kathmandu",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Khichapokhari, Pako, Mahabouddha & Indrachowk",
    localIntro: "Nepal's most dense commercial trading hub requires maximum visual punch. In crowded multi-story retail arcades, projecting 2D double-sided light boxes and bright LED signage help shops dominate foot traffic lanes.",
    latitude: 27.7032,
    longitude: 85.3117,
    popularLocalBusinesses: ["Electronics & Mobile Hubs", "Wholesale Clothing Showrooms", "Jewelry Boutiques", "Optical & Watch Stores"]
  },
  {
    id: "chabahil-bouddha",
    slug: "chabahil-bouddha",
    name: "Chabahil & Bouddha",
    district: "Kathmandu",
    regionType: "Kathmandu Valley Hub",
    deliveryTime: "1 to 2 Days (Free Valley Delivery)",
    landmarkReference: "Bouddha Stupa Circle, KL Tower, Chabahil Chowk & Hyatt Regency road",
    localIntro: "From serene rooftop restaurants overlooking the Bouddha Stupa to bustling retail complexes in Chabahil, businesses combine spiritual motifs with contemporary glowing neon designs to welcome international visitors.",
    latitude: 27.7215,
    longitude: 85.3620,
    popularLocalBusinesses: ["Stupa View Rooftop Restaurants", "Tibetan Art & Thangka Studios", "Apparel Stores in KL Tower", "Hospitality Guesthouses"]
  },
  {
    id: "pokhara",
    slug: "pokhara",
    name: "Pokhara (Lakeside & Mahendrapool)",
    district: "Kaski",
    regionType: "Major Nepal City",
    deliveryTime: "2 to 3 Days (Express Secured Courier)",
    landmarkReference: "Phewa Lakeside, Chipledhunga, Old Pokhara & Sarangkot road",
    localIntro: "Pokhara is Nepal's premier tourism paradise. Lakeside cafes, paragliding companies, and boutique resorts rely on KTM DECOR for weather-sealed IP67 neon signs and double-sided projecting light boxes delivered safely via express courier.",
    latitude: 28.2096,
    longitude: 83.9856,
    popularLocalBusinesses: ["Lakefront Resorts & Spas", "Adventure Tour Agencies", "Live Music Cafes & Pizzerias", "Boutique Souvenir Stores"]
  },
  {
    id: "butwal",
    slug: "butwal",
    name: "Butwal & Rupandehi",
    district: "Rupandehi",
    regionType: "Major Nepal City",
    deliveryTime: "2 to 3 Days (Express Courier)",
    landmarkReference: "Traffic Chowk, Golpark, Devinagar & Milanchowk",
    localIntro: "Western Nepal's bustling commercial center where medical institutions, trade showrooms, and modern shopping complexes order durable 3D acrylic signboards that resist intense Terai summer heat.",
    latitude: 27.7006,
    longitude: 83.4483,
    popularLocalBusinesses: ["Automobile Dealerships", "Commercial Banks & Co-operatives", "Healthcare Diagnostic Centers", "Departmental Stores"]
  },
  {
    id: "biratnagar",
    slug: "biratnagar",
    name: "Biratnagar & Morang",
    district: "Morang",
    regionType: "Major Nepal City",
    deliveryTime: "2 to 3 Days (Express Courier)",
    landmarkReference: "Main Road, Traffic Chowk, Roadcess Chowk & Bargachhi",
    localIntro: "The industrial powerhouse of Eastern Nepal, where factory administrative headquarters, corporate hospitals, and commercial banks demand robust exterior 3D signboards and illuminated LED light displays.",
    latitude: 26.4525,
    longitude: 87.2718,
    popularLocalBusinesses: ["Industrial Group Head Offices", "Private Hospitals & Labs", "Commercial Banks", "Shopping Malls on Main Road"]
  },
  {
    id: "chitwan",
    slug: "chitwan",
    name: "Chitwan (Bharatpur & Sauraha)",
    district: "Chitwan",
    regionType: "Major Nepal City",
    deliveryTime: "2 to 3 Days (Express Courier)",
    landmarkReference: "Lion's Chowk Narayangarh, Chaubiskothi Bharatpur & Sauraha Tourist St.",
    localIntro: "Serving both the safari jungle lodges of Sauraha and the major medical/commercial hubs of Bharatpur and Narayangarh with custom wooden decor, illuminated light boards, and custom neon branding.",
    latitude: 27.6833,
    longitude: 84.4333,
    popularLocalBusinesses: ["Jungle Safari Resorts", "Medical Colleges & Hospitals", "Agro-Business Corporate Offices", "Narayangarh Retail Showrooms"]
  }
];
