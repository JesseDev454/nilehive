create unique index if not exists event_feedback_one_per_student_per_event_idx
on public.event_feedback (proposal_id, submitted_by)
where category = 'event' and proposal_id is not null;
