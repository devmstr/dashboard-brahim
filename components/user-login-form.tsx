'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { userLoginSchema } from '@/lib/validations/auth'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { toast } from '@ui/use-toast'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'

interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userLoginSchema>

export function UserLoginForm({ className, ...props }: UserLoginFormProps) {
  const form = useForm<FormData>({
    defaultValues: {
      name: 'admin',
      password: 'Admin1234'
    },
    resolver: zodResolver(userLoginSchema)
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] =
    React.useState<boolean>(false)
  const { push } = useRouter()

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    try {
      const res = await signIn('singIn', {
        username: data.name.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: '/dashboard'
      })
      if (res?.ok) {
        push('/dashboard/timeline')
      } else {
        toast({
          title: 'Veuillez réessayer.',
          description:
            "Vos identifiants sont incorrects. Veuillez vérifier votre nom d'utilisateur et votre mot de passe puis réessayer.",
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.info(error)
      toast({
        title: 'Error Occurred',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom D'utilisateur</FormLabel>
                  <FormControl>
                    <Input placeholder="Username Ici..." {...field} />
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
                  <FormLabel>Mot de passe.</FormLabel>
                  <FormControl className="">
                    <div className="relative">
                      <Input
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder="password here..."
                        autoComplete="current-password"
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
          </div>
          <Button className="w-full" type="submit">
            Connecter
          </Button>
        </form>
      </Form>
    </div>
  )
}
