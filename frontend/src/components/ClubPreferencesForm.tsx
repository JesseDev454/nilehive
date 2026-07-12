import { useState } from "react";
import type { ClubPreferencesPayload, ClubPreferencesRecord } from "@/lib/api";
import { CLUB_INTEREST_CATEGORIES } from "@/lib/clubDiscovery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const groups = [
  { key: "interests", title: "Interests", options: CLUB_INTEREST_CATEGORIES.map((value) => ({ value, label: value })) },
  { key: "skills", title: "Skills you want to build", options: [
    ["communication", "Communication"], ["leadership", "Leadership"], ["technical", "Technical"], ["design", "Design"], ["research", "Research"], ["entrepreneurship", "Entrepreneurship"], ["event_planning", "Event planning"], ["media_content", "Media / content"], ["teamwork", "Teamwork"], ["community_service", "Community service"]
  ].map(([value, label]) => ({ value, label })) },
  { key: "career_goals", title: "Career goals", options: [
    ["portfolio_building", "Build a portfolio"], ["leadership", "Develop leadership"], ["networking", "Grow my network"], ["technology", "Learn technology"], ["entrepreneurship", "Explore entrepreneurship"], ["public_speaking", "Improve public speaking"], ["creative_practice", "Creative practice"], ["community_impact", "Community impact"], ["academic_enrichment", "Academic enrichment"]
  ].map(([value, label]) => ({ value, label })) },
  { key: "availability", title: "Availability", options: [
    ["weekday_daytime", "Weekday daytime"], ["weekday_evening", "Weekday evening"], ["weekend", "Weekend"], ["flexible", "Flexible"]
  ].map(([value, label]) => ({ value, label })) }
] as const;

type MultiValueKey = "interests" | "skills" | "career_goals" | "availability";

export function ClubPreferencesForm({ initial, pending = false, onSubmit, onSkip }: {
  initial?: ClubPreferencesRecord | null;
  pending?: boolean;
  onSubmit: (payload: ClubPreferencesPayload) => void;
  onSkip?: () => void;
}) {
  const [values, setValues] = useState<Record<MultiValueKey, string[]>>({
    interests: initial?.interests ?? [], skills: initial?.skills ?? [], career_goals: initial?.career_goals ?? [], availability: initial?.availability ?? []
  });
  const [commitment, setCommitment] = useState(initial?.weekly_commitment ?? "");
  const complete = groups.every((group) => values[group.key].length > 0) && Boolean(commitment);

  function toggle(group: MultiValueKey, value: string, checked: boolean) {
    setValues((current) => ({ ...current, [group]: checked ? [...new Set([...current[group], value])] : current[group].filter((item) => item !== value) }));
  }

  return (
    <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); if (complete) onSubmit({ ...values, weekly_commitment: commitment as ClubPreferencesPayload["weekly_commitment"], status: "completed" }); }}>
      {groups.map((group) => (
        <fieldset key={group.key} className="space-y-3">
          <legend className="font-semibold text-foreground">{group.title}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {group.options.map((option) => {
              const id = `${group.key}-${option.value}`;
              return <Label key={option.value} htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm text-card-foreground">
                <Checkbox id={id} checked={values[group.key].includes(option.value)} onCheckedChange={(checked) => toggle(group.key, option.value, checked === true)} />
                {option.label}
              </Label>;
            })}
          </div>
        </fieldset>
      ))}
      <fieldset className="space-y-3">
        <legend className="font-semibold text-foreground">Weekly commitment</legend>
        <RadioGroup value={commitment} onValueChange={setCommitment} className="grid gap-2 sm:grid-cols-3">
          {["1-2", "3-5", "6+"].map((value) => <Label key={value} htmlFor={`commitment-${value}`} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"><RadioGroupItem id={`commitment-${value}`} value={value} />{value} hours</Label>)}
        </RadioGroup>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-2">
        {onSkip ? <Button type="button" variant="ghost" onClick={onSkip} disabled={pending}>Skip for now</Button> : null}
        <Button type="submit" disabled={!complete || pending}>{pending ? "Saving..." : "Save preferences"}</Button>
      </div>
    </form>
  );
}
