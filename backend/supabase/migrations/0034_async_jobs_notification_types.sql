do $$
begin
  if not exists (
    select 1
    from pg_enum
    where enumlabel = 'missing_report_prompt'
      and enumtypid = 'public.notification_type'::regtype
  ) then
    alter type public.notification_type add value 'missing_report_prompt';
  end if;
end $$;
