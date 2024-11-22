import { Metadata } from 'next'
import Link from 'next/link'
import { UserLoginForm } from '@/components/user-login-form'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { signIn } from 'next-auth/react'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

export default async function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center h-[93vh] w-full bg-slate-100">
      <div className="container flex justify-center">
        <div className="flex bg-background  rounded-md w-fit h-fit p-8  flex-col  space-y-6 drop-shadow-md">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {'Bienvenue'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {"Veuillez entrer votre nom d'utilisateur et votre mot de passe."}
            </p>
          </div>
          <UserLoginForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-brand underline underline-offset-4"
            >
              Vous n&apos;avez pas de compte ? Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
