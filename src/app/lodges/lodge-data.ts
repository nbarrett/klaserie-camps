export interface LodgeShowcase {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  heroImages: string[];
  capacity: string;
  location: string;
}

export const LODGE_DATA: LodgeShowcase[] = [
  {
    slug: "nzumba",
    name: "Nzumba Camp",
    tagline: "Colonial charm on the Klaserie River",
    description:
      "Nestled in the remote northwestern region of the Klaserie Private Nature Reserve, Nzumba Camp traverses 7,000 hectares of pristine bushveld nourished by the iconic Klaserie River. Five luxurious thatched chalets overlook flowing lawns, a sparkling pool, and a nearby waterhole frequented by elephant, lion, leopard and rhino. The elegant main lodge — complete with leather lounges, safari memorabilia and an upstairs bar — echoes the romance of a bygone era.",
    highlights: [
      "Big Five traversing area",
      "Exclusive 7,000 ha concession",
      "Waterhole-facing suites",
      "Open 4x4 game drives & bush walks",
      "Klaserie River frontage",
    ],
    heroImages: ["/hero-elephants.jpg", "/images/mammals.jpg", "/hero-rhinos.webp"],
    capacity: "10 guests in 5 thatched chalets",
    location: "North-western Klaserie Private Nature Reserve",
  },
  {
    slug: "kitara",
    name: "Kitara Camp",
    tagline: "Contemporary luxury on the riverbank",
    description:
      "Kitara Camp is a five-star riverbank lodge set on the banks of the beautiful Klaserie River in the Greater Kruger. Six spacious suites offer sweeping views of the pristine river setting — a common footpath for much of the local wildlife. Blending contemporary luxury with natural style, every suite features Victorian baths, indoor and outdoor showers, private patios and fully stocked bars. Morning and afternoon game drives with expert guides provide exceptional Big Five encounters.",
    highlights: [
      "Five-star river lodge",
      "Indoor & outdoor showers",
      "Private suite patios",
      "Twice-daily expert-guided game drives",
      "Walking safaris available",
    ],
    heroImages: ["/images/birds.jpg", "/hero-rhinos.webp", "/hero-elephants.jpg"],
    capacity: "12 guests in 6 luxury suites",
    location: "Klaserie River, Greater Kruger",
  },
];

export function getLodgeBySlug(slug: string): LodgeShowcase | undefined {
  return LODGE_DATA.find((l) => l.slug === slug);
}
