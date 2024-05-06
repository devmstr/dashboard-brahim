'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button, buttonVariants } from '@ui/button'
import { Input } from '@ui/input'
import { toast } from '@ui/use-toast'
import { cn } from '@/lib/utils'
import { userSignUpSchema } from '@/lib/validations/auth'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
  Form
} from './ui/form'
import { ROLES, ROLES_MAP } from '@/config/accounts'
import { Selector } from './selector'

interface UserSingUpFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userSignUpSchema>

export const UserSingUpForm: React.FC<UserSingUpFormProps> = ({
  className,
  ...props
}: UserSingUpFormProps) => {
  const getUserRole = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'admin'
      case 'Commerciale':
        return 'sales'
      case 'Production':
        return 'production'
      case 'Technicien':
        return 'engineering'
    }
  }

  const form = useForm<FormData>({
    defaultValues: {
      role: ROLES_MAP[1]
    },
    resolver: zodResolver(userSignUpSchema)
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] =
    React.useState<boolean>(false)

  const role = form.watch('role')

  async function onSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      await signIn('register', {
        username: formData.name,
        password: formData.password,
        role: getUserRole(formData.role)
      })
      toast({
        title: 'Success!',
        description: 'A new Account has been created successfully.'
      })
    } catch (error) {
      console.log(error)
      // toast({
      //   title: er.data.error,
      //   description: axiosError.response.data.message,
      //   variant: 'destructive'
      // })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <div className="space-y-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom D'utilisateur</FormLabel>
                  <FormControl>
                    <Input placeholder="Username here..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de pass</FormLabel>
                  <FormControl className="">
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="password here..."
                        {...field}
                      />
                      <Icons.eye
                        className="absolute right-2 top-[0.85rem] w-4 h-4 text-foreground/40  cursor-pointer"
                        open={isPasswordVisible}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Selector
                      {...field}
                      items={ROLES_MAP}
                      setValue={(value) => form.setValue('role', value)}
                      value={role!}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 

              TODO: check box for marketing emails acceptance 
             
            */}
          </div>
          <Button className="w-full" type="submit">
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin " />
            )}
            Register
          </Button>
        </form>
      </Form>
    </div>
  )
}
