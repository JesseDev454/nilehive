
import { useState, useRef, useEffect } from "react";
import { Users, Search as SearchIcon, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Club list

export const CLUBS: { id: string; name: string; cat: string; color: string }[] = [
  { id: "eng_soc", name: "Engineering Society", cat: "Technology", color: "#0d5bbc" },
  { id: "tech_nile", name: "Tech Nile", cat: "Technology", color: "#0d5bbc" },
  { id: "ieee", name: "IEEE Student Branch", cat: "Technology", color: "#0d5bbc" },
  { id: "gdsc", name: "Google Developer Student Club", cat: "Technology", color: "#0d5bbc" },
  { id: "robotics", name: "Robotics Club", cat: "Technology", color: "#0d5bbc" },
  { id: "debate", name: "Debate Union", cat: "Academic", color: "#0891b2" },
  { id: "drama", name: "Drama & Theatre Society", cat: "Arts & Culture", color: "#7c3aed" },
  { id: "photo", name: "Photography Club", cat: "Arts & Culture", color: "#7c3aed" },
  { id: "fine_arts", name: "Fine Arts Collective", cat: "Arts & Culture", color: "#7c3aed" },
  { id: "entrepreneur", name: "Entrepreneurship Club", cat: "Business", color: "#b45309" },
  { id: "finance", name: "Finance & Investment Society", cat: "Business", color: "#b45309" },
  { id: "bio", name: "Biology Research Group", cat: "Science", color: "#0891b2" },
  { id: "basketball", name: "Basketball Association", cat: "Sports", color: "#15803d" },
  { id: "chess", name: "Chess Club", cat: "Sports", color: "#15803d" },
  { id: "community", name: "Community Service Club", cat: "Volunteer", color: "#be185d" },
  { id: "redcross", name: "Red Cross Campus Chapter", cat: "Volunteer", color: "#be185d" },
];

interface NhClubDropdownProps {
  value
  onChange: (name: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function NhClubDropdown({
  value,
  onChange,
  placeholder = "Select your society / club",
  required,
  className,
}: NhClubDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = CLUBS.find((c) => c.name === value) ?? null;

  // close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // focus search when panel opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  const filtered = query.trim()
    ? CLUBS.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.cat.toLowerCase().includes(query.toLowerCase())
    )
    : CLUBS;

  // group by category
  const grouped = filtered.reduce<Record<string, typeof CLUBS>>((acc, c) => {
    (acc[c.cat] = acc[c.cat] ?? []).push(c);
    return acc;
  }, {});

  function pick(club: (typeof CLUBS)[0]) {
    onChange(club.name); // to pass name string to parent — matches existing clubName state
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      {/* Trigger button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border-0 bg-[#f1f4f7]",
          "px-5 py-4 text-left text-sm transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d5bbc]/30",
          "hover:bg-[#e5e8eb]",
          open && "bg-white ring-2 ring-[#0d5bbc]/22"
        )}
      >
        {/* left icon */}
        <Users className="h-5 w-5 shrink-0 text-[#75777f]" />

        {/* label / badge */}
        {selected ? (
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ background: selected.color }}
            />
            <span className="truncate font-semibold text-[#181c1e]">{selected.name}</span>
          </span>
        ) : (
          <span className="flex-1 text-[#c4c6cf]">{placeholder}</span>
        )}

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#75777f] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* hidden native input with validation*/}
      <input
        type="text"
        tabIndex={-1}
        readOnly
        required={required}
        value={value}
        className="absolute inset-0 opacity-0 pointer-events-none w-full"
        aria-hidden
      />

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-2xl bg-white shadow-[0_8px_32px_rgba(11,35,71,0.13),0_2px_8px_rgba(11,35,71,0.07)]">

          {/* search bar */}
          <div className="relative border-b border-[#ebeef1] px-3 py-2">
            <SearchIcon className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#75777f]" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs…"
              className="w-full rounded-xl bg-[#f1f4f7] py-2 pl-8 pr-3 text-sm text-[#181c1e] outline-none placeholder:text-[#c4c6cf]"
            />
          </div>

          {/* list */}
          <ul
            role="listbox"
            className="max-h-56 overflow-y-auto p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#c4c6cf]"
          >
            {Object.keys(grouped).length === 0 ? (
              <li className="py-3 text-center text-sm text-[#75777f]">
                No clubs found for "{query}"
              </li>
            ) : (
              Object.entries(grouped).map(([cat, clubs]) => (
                <li key={cat}>
                  <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-[#75777f]">
                    {cat}
                  </p>
                  {clubs.map((club) => (
                    <button
                      key={club.id}
                      type="button"
                      role="option"
                      aria-selected={selected?.id === club.id}
                      onClick={() => pick(club)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors",
                        selected?.id === club.id
                          ? "bg-[#0d5bbc]/07 text-[#0d5bbc]"
                          : "text-[#181c1e] hover:bg-[#f1f4f7]"
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: club.color }}
                      />
                      <span className="flex-1 truncate">{club.name}</span>
                      {selected?.id === club.id && (
                        <Check className="h-4 w-4 shrink-0 text-[#0d5bbc]" />
                      )}
                    </button>
                  ))}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
