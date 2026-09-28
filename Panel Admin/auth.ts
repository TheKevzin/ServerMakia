import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        // Check master password override
        const masterPassword = process.env.MASTER_PASSWORD || 'enderlab'
        if (credentials.username === 'admin' && credentials.password === masterPassword) {
          return { id: "admin-master", name: "Admin", email: "admin@enderlab.local", role: "ADMIN" }
        }

        // DB logic for real users when implemented
        const user = await prisma.user.findFirst({
          where: { email: credentials.username as string }
        })

        if (user && user.password) {
          const isValid = await bcrypt.compare(credentials.password as string, user.password)
          if (isValid) return { id: user.id, name: user.name, email: user.email, role: user.role }
        }

        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  }
})
