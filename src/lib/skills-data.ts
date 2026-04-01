export type SkillCategory = {
  id: string;
  label: string;
  moves: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "warm_ups",
    label: "Warm-Ups & Foundations",
    moves: [
      "Front Plank", "Back Plank", "Throne", "Half Frog",
      "Whale", "Toad", "Folded Leaf", "High Flying Whale",
    ],
  },
  {
    id: "l_basing_basics",
    label: "L-Basing Basics",
    moves: [
      "Bird", "Star", "Side Star", "Folded Bird",
      "Reverse Bird", "Foot to Hand (Low)", "Foot to Hand (High)",
      "Shoulderstand", "Candlestick",
    ],
  },
  {
    id: "l_basing_intermediate",
    label: "L-Basing Intermediate",
    moves: [
      "Bow", "Ninja Star", "Back Bird", "Free Star",
      "Hand to Hand (Low)", "Hand to Hand (Extended)", "Barrel Roll",
      "Bed / Log", "Ballerina",
    ],
  },
  {
    id: "washing_machines",
    label: "Washing Machines",
    moves: [
      "Helicopter", "Boomerang", "Corkscrew", "Catherine's Wheel",
      "Nunchucks", "Monkey Frog", "Star Wars", "Swimming Mermaid",
    ],
  },
  {
    id: "inversions",
    label: "Inversions",
    moves: [
      "Supported Handstand", "Foot to Handstand", "Straddle Bat",
      "Tuck Bat", "Cartwheel Entrance", "Icarian Press",
      "Straight Body Press to Handstand",
    ],
  },
  {
    id: "standing",
    label: "Standing Acrobatics",
    moves: [
      "Shoulder Stand (Standing)", "Vertical Dance",
      "Front Bird (Standing)", "Hand to Hand (Standing)",
      "Back Sit", "Shoulder Sit",
    ],
  },
  {
    id: "flows",
    label: "Flows & Sequences",
    moves: [
      "Bird to Star", "Star to Star", "Star to Throne",
      "Reverse Throne Combo", "F2S to S2F",
      "Ninja Flow", "Washing Machine into Inversion",
    ],
  },
];

export const ALL_MOVES = SKILL_CATEGORIES.flatMap(c => c.moves);
