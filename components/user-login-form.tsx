'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'
import { userLoginSchema, UserLoginSchemaType } from '@/lib/validations/auth'
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

export function UserLoginForm({ className, ...props }: UserLoginFormProps) {
  const form = useForm<UserLoginSchemaType>({
    resolver: zodResolver(userLoginSchema)
  })
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] =
    React.useState<boolean>(false)
  const { push } = useRouter()

  async function onSubmit(data: UserLoginSchemaType) {
    setIsLoading(true)
    try {
      const res = await signIn('singIn', {
        username: data.input.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: '/dashboard'
      })
      if (res?.ok) {
        push('/dashboard')
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
              name="input"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    E-mail ou Nom D'utilisateur ou Number Employee
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E-mail ou Nom D'utilisateur ou Number Employee Ici..."
                      {...field}
                    />
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
