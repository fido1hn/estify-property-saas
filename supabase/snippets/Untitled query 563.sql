SELECT conname, conkey::int[]
FROM pg_constraint
WHERE conrelid = 'public.units'::regclass
  AND contype = 'u';
