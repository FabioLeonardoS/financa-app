import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // =========================================================================
  // Página customizada de login
  // =========================================================================
  pages: {
    signIn: "/login",
  },

  // =========================================================================
  // Sessão via JWT (stateless, sem banco de sessões)
  // =========================================================================
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },

  // =========================================================================
  // Providers
  // =========================================================================
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe o e-mail e a senha.");
        }

        // Busca usuário pelo e-mail
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado.");
        }

        // Compara a senha informada com o hash salvo
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Senha incorreta.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],

  // =========================================================================
  // Callbacks: propaga o id do usuário para o token e sessão
  // =========================================================================
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // =========================================================================
  // Secret (deve estar em .env como NEXTAUTH_SECRET)
  // =========================================================================
  secret: process.env.NEXTAUTH_SECRET,
};
