-- AlterTable
ALTER TABLE "routines"
ADD COLUMN "horario_inicio" VARCHAR(5);

-- Preserve the canonical HH:mm format even for writes outside the API.
ALTER TABLE "routines"
ADD CONSTRAINT "routines_horario_inicio_format_check"
CHECK (
  "horario_inicio" IS NULL
  OR "horario_inicio" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
);
