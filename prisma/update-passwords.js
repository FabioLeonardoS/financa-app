/**
 * Script rápido: aplica hash bcrypt na senha padrão "mudar123"
 * para os usuários Fábio e Priscila já existentes no banco.
 *
 * Executar com: node prisma/update-passwords.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Aplicando senhas com hash bcrypt...\n");

  const hash = await bcrypt.hash("mudar123", 10);

  const emails = ["fabio@financa.app", "priscila@financa.app"];

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(`⚠️  Usuário não encontrado: ${email}`);
      continue;
    }
    await prisma.user.update({
      where: { email },
      data: { password: hash },
    });
    console.log(`✅ Senha definida para: ${user.name} (${email})`);
  }

  console.log("\n🎉 Pronto! Senha padrão: mudar123");
  console.log("⚠️  Lembre-se de trocar a senha após o primeiro acesso!\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
