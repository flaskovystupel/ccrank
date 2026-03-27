import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!profile?.login) return false

      try {
        // Delete any demo user with same username but different githubId
        await prisma.user.deleteMany({
          where: {
            username: profile.login as string,
            githubId: { not: String(profile.id) },
          },
        })

        await prisma.user.upsert({
          where: { githubId: String(profile.id) },
          update: {
            username: profile.login as string,
            name: user.name || (profile.name as string) || null,
            email: user.email || null,
            avatarUrl: user.image || (profile.avatar_url as string) || null,
            bio: (profile.bio as string) || null,
          },
          create: {
            githubId: String(profile.id),
            username: profile.login as string,
            name: user.name || (profile.name as string) || null,
            email: user.email || null,
            avatarUrl: user.image || (profile.avatar_url as string) || null,
            bio: (profile.bio as string) || null,
          },
        })
      } catch (error) {
        console.error('SignIn error:', error)
        return false
      }
      return true
    },
    async jwt({ token, profile }) {
      if (profile?.login) {
        const dbUser = await prisma.user.findUnique({
          where: { githubId: String(profile.id) },
        })
        if (dbUser) {
          token.userId = dbUser.id
          token.username = dbUser.username
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = session.user as any
        user.id = token.userId
        user.username = token.username
      }
      return session
    },
  },
})
