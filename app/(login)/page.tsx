import { Metadata } from 'next'
import Link from 'next/link'
import { UserLoginForm } from '@/components/user-login-form'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { signIn } from 'next-auth/react'
import { Icons } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

export default async function LoginPage() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen w-full">
      <div className="container flex justify-center h-[80vh] max-w-5xl p-10">
        <div className="w-1/2 flex justify-center gap-5 bg-background rounded-l-md h-full p-8  flex-col  space-y-2 drop-shadow-md">
          <div className="flex flex-col space-y-2 text-start">
            <h1 className="text-2xl font-light">{'Bienvenue à'}</h1>
            <h1 className="flex text-5xl ">
              <strong className="font-medium">SONERAS</strong>
              <span className="font-light">Flow</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {"Veuillez entrer votre nom d'utilisateur et votre mot de passe."}
            </p>
          </div>
          <UserLoginForm />
        </div>
        <div className="w-1/2 h-full flex justify-center items-center rounded-r-md bg-primary">
          <div className="flex gap-5 flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-8">
              <Icons.logo className="w-36 h-auto" />
              <Icons.identity className="w-auto h-8" />
            </div>
            <p className="flex gap-2 text-secondary text-lg">
              <span>Logistics</span>
              <span> -</span>
              <span>Industry</span>
              <span> -</span>
              <span>Trading</span>
            </p>
            <span className="text-lg text-secondary">
              {'1969/' + new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
