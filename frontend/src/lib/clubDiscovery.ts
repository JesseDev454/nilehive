import type { ClubRecord, ProfileRecord } from "./api";

export const CLUB_INTEREST_CATEGORIES = [
  "Tech",
  "Gaming",
  "Music",
  "Entrepreneurship",
  "Sports",
  "Volunteering",
  "Academics",
  "Media",
  "Arts",
  "Leadership"
] as const;

export type ClubInterestCategory = (typeof CLUB_INTEREST_CATEGORIES)[number];

const CLUB_CODE_CATEGORIES: Record<string, ClubInterestCategory[]> = {
  NCIC: ["Tech", "Volunteering", "Arts"],
  NGD: ["Tech", "Volunteering", "Academics"],
  WIT: ["Tech", "Entrepreneurship", "Volunteering"],
  NGC: ["Gaming", "Sports"],
  NCAC: ["Music", "Media", "Arts"],
  NBUC: ["Entrepreneurship"],
  NSC: ["Entrepreneurship", "Arts"],
  NCC: ["Volunteering", "Academics", "Arts"],
  NBC: ["Academics"],
  NDC: ["Academics", "Leadership"],
  NMUN: ["Academics", "Media", "Leadership"],
  NTC: ["Academics", "Leadership"],
  NPC: ["Media"],
  TEDX: ["Media", "Arts"]
};

const CATEGORY_KEYWORDS: Record<ClubInterestCategory, string[]> = {
  Tech: ["tech", "developer", "google", "code", "coding", "software", "computer", "data", "ai", "robotics", "women in tech"],
  Gaming: ["game", "gaming", "esport", "chess", "board game", "video game"],
  Music: ["music", "choir", "band", "sound", "instrument", "song"],
  Entrepreneurship: ["business", "startup", "entrepreneur", "innovation", "venture", "founder", "finance"],
  Sports: ["sport", "football", "basketball", "fitness", "athletic", "volleyball", "tennis"],
  Volunteering: ["charity", "volunteer", "community", "outreach", "service", "climate", "sustainability"],
  Academics: ["academic", "book", "debate", "model united", "mun", "research", "science", "study"],
  Media: ["media", "photo", "photography", "film", "press", "content", "journalism", "tedx"],
  Arts: ["art", "creative", "design", "drama", "theatre", "dance", "painting", "poetry"],
  Leadership: ["leadership", "toastmaster", "debate", "model united", "mun", "public speaking", "diplomacy"]
};

function normalize(value: string | null | undefined) {
  return value?.toLowerCase().trim() ?? "";
}

export function getClubInterestCategories(club: Pick<ClubRecord, "name" | "code" | "description" | "categories">): ClubInterestCategory[] {
  const persisted = (club.categories || []).filter((category): category is ClubInterestCategory =>
    CLUB_INTEREST_CATEGORIES.includes(category as ClubInterestCategory)
  );
  if (persisted.length > 0) return persisted;
  const mapped = CLUB_CODE_CATEGORIES[normalize(club.code).toUpperCase()];
  if (mapped?.length) return mapped;
  const searchableText = [club.name, club.code, club.description].map(normalize).join(" ");
  const matches = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => searchableText.includes(keyword)))
    .map(([category]) => category as ClubInterestCategory);

  return matches;
}

export function getStudentInterestCategories(
  profile: Pick<ProfileRecord, "department" | "join_reason"> | null | undefined
): ClubInterestCategory[] {
  const searchableText = [profile?.department, profile?.join_reason].map(normalize).join(" ");
  const matches = Object.entries(CATEGORY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => searchableText.includes(keyword)))
    .map(([category]) => category as ClubInterestCategory);

  if (searchableText.includes("computer") || searchableText.includes("engineering")) {
    matches.push("Tech", "Academics");
  }

  if (searchableText.includes("business") || searchableText.includes("account") || searchableText.includes("economics")) {
    matches.push("Entrepreneurship");
  }
  if (searchableText.includes("law")) matches.push("Leadership", "Academics");
  if (searchableText.includes("mass communication") || searchableText.includes("journalism")) matches.push("Media");
  if (searchableText.includes("medicine") || searchableText.includes("nursing") || searchableText.includes("public health")) matches.push("Academics");
  if (searchableText.includes("architecture") || searchableText.includes("design")) matches.push("Arts");

  return Array.from(new Set(matches));
}
