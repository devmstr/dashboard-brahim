import { buttonVariants } from '@/components/ui/button'
import { UserSingUpForm } from '@/components/user-sign-up-form'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PageProps {}

const Page: React.FC<PageProps> = ({}: PageProps) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-[83vh] w-full ">
      <div className="hidden bg-muted lg:block" />
      <div className="flex bg-background rounded-md w-fit h-fit p-8  flex-col  space-y-6 drop-shadow-md">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {'Créer un compte'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {
              "Entrez votre nom d'utilisateur ci-dessous pour créer votre compte."
            }
          </p>
        </div>
        <UserSingUpForm />
      </div>
    </div>
  )
}

export default Page
