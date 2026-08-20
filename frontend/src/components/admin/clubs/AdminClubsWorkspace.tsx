import { useMemo, useState } from "react";
import { AdminClubsHeader } from "./AdminClubsHeader";
import { AdminClubCard } from "./AdminClubCard";
import { AdminClubDetailModal } from "./AdminClubDetailModal";
import { AdminClubEditSheet } from "./AdminClubEditSheet";
import {
  OFFICIAL_14_CLUBS_DATA,
  type OfficialClub,
} from "@/data/official14ClubsData";

export function AdminClubsWorkspace() {
  const [clubs, setClubs] = useState(OFFICIAL_14_CLUBS_DATA);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<OfficialClub | null>(null);
  const [editing, setEditing] = useState<OfficialClub | null>(null);
  const categories = ["All", ...new Set(clubs.map((club) => club.category))];
  const visible = useMemo(
    () =>
      clubs.filter(
        (club) =>
          (category === "All" || club.category === category) &&
          `${club.name} ${club.code} ${club.presidentName}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [clubs, category, search],
  );

  const saveClub = (updated: OfficialClub) => {
    setClubs((items) => items.map((club) => (club.id === updated.id ? updated : club)));
    setEditing(null);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 pb-16">
      <AdminClubsHeader
        totalClubs={clubs.length}
        searchTerm={search}
        onSearchChange={setSearch}
        selectedCategory={category}
        onCategoryChange={setCategory}
        categories={categories}
      />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((club) => (
          <AdminClubCard key={club.id} club={club} onInspect={setSelected} onEdit={setEditing} />
        ))}
      </div>
      <AdminClubDetailModal
        club={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        onEditClub={(club) => {
          setSelected(null);
          setEditing(club);
        }}
      />
      <AdminClubEditSheet
        club={editing}
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        onSaveClub={saveClub}
      />
    </section>
  );
}
