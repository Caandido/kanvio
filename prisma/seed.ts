import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Popula o banco com um quadro de exemplo para você ver a app funcionando.
 * Roda com: npm run db:seed
 */
async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@kanvio.local" },
    update: {},
    create: { name: "Usuário Demo", email: "demo@kanvio.local" },
  });

  const workspace =
    (await prisma.workspace.findFirst({ where: { ownerId: user.id } })) ??
    (await prisma.workspace.create({
      data: { name: "Meu Workspace", ownerId: user.id },
    }));

  // Evita duplicar o seed se rodar mais de uma vez.
  const existing = await prisma.board.findFirst({
    where: { title: "Projeto de Exemplo", workspaceId: workspace.id },
  });
  if (existing) {
    console.log("Seed já aplicado. Quadro:", existing.id);
    return;
  }

  const board = await prisma.board.create({
    data: { title: "Projeto de Exemplo", workspaceId: workspace.id },
  });

  const columns = ["A Fazer", "Em Andamento", "Concluído"];
  for (let i = 0; i < columns.length; i++) {
    const column = await prisma.column.create({
      data: { title: columns[i], boardId: board.id, position: i },
    });

    if (i === 0) {
      const tasks = ["Configurar ambiente", "Modelar banco de dados", "Criar layout"];
      for (let j = 0; j < tasks.length; j++) {
        await prisma.card.create({
          data: {
            title: tasks[j],
            columnId: column.id,
            position: j,
            createdBy: user.id,
          },
        });
      }
    }
  }

  console.log("✅ Seed concluído. Quadro de exemplo:", board.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
