-- AlterTable
ALTER TABLE "routine_recurrence_rules"
ADD COLUMN "horario_inicio" VARCHAR(5),
ADD COLUMN "data_inicio" DATE;

-- Preserve the canonical HH:mm format even for writes outside the API.
ALTER TABLE "routine_recurrence_rules"
ADD CONSTRAINT "routine_recurrence_rules_horario_inicio_format_check"
CHECK (
  "horario_inicio" IS NULL
  OR "horario_inicio" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
);
