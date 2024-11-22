import { UserSingUpForm } from '@/components/user-sign-up-form'

interface PageProps {}

const Page: React.FC<PageProps> = async ({}: PageProps) => {
  // const data = await db.user.findMany({
  //   select: {
  //     id: true,
  //     username: true,
  //     email: true,
  //     role: true,
  //     passwordHash: true,
  //     updatedAt: true
  //   }
  // })
  // if (!data) return null
  return (
    <div className="relative flex flex-col items-center justify-center ">
      <div className="hidden bg-muted lg:block" />
      <div className="flex bg-background rounded-md  h-fit p-8  flex-col  space-y-6 drop-shadow-md ">
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
        {/* <PasswordsTable data={data} /> */}
      </div>
    </div>
  )
}

export default Page
