-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "pinParental" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token_recuperacao" TEXT,
    "expiracao_recuperacao" TIMESTAMP(3),

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idade" INTEGER NOT NULL,
    "sons_ativos" BOOLEAN NOT NULL DEFAULT true,
    "vibracao_ativa" BOOLEAN NOT NULL DEFAULT true,
    "animacoes_ativas" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "tempo_estimado" DOUBLE PRECISION NOT NULL,
    "imgTarefa" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "dataTarefa" TIMESTAMP(3) NOT NULL,
    "usa_subtarefas" BOOLEAN NOT NULL DEFAULT false,
    "prioridade" INTEGER NOT NULL DEFAULT 1,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subtask" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "nomeTarefa" TEXT NOT NULL,
    "imgTarefa" TEXT,
    "tarefa_completada" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subtask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_email_key" ON "client"("email");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine" ADD CONSTRAINT "routine_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subtask" ADD CONSTRAINT "subtask_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
