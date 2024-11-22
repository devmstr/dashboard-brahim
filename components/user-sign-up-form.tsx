'use client'

import { Icons } from '@/components/icons'
import { ROLES, ROLES_MAP } from '@/config/accounts'
import { cn } from '@/lib/utils'
import { userSignUpSchema, UserSignUpSchemaType } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import { toast } from '@ui/use-toast'
import { signIn } from 'next-auth/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Selector } from './selector'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './ui/form'

interface UserSingUpFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export const UserSingUpForm: React.FC<UserSingUpFormProps> = ({
  className,
  ...props
}: UserSingUpFormProps) => {
  const form = useForm<UserSignUpSchemaType>({
    defaultValues: {
      role: 'SALES'
    },
    resolver: zodResolver(userSignUpSchema)
  })
  const role = form.watch('role')
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] =
    React.useState<boolean>(false)

  async function onSubmit(formData: UserSignUpSchemaType) {
    setIsLoading(true)
    try {
      await signIn('register', formData)

      toast({
        title: 'Success!',
        description: 'A new Account has been created successfully.'
      })
      form.reset()
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="E-mail ici..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numero Employee</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Numero D'Employee ici..."
                      onChange={({ target: { value } }) =>
                        form.setValue('employeeId', Number(value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom D'utilisateur</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Username here..."
                      autoComplete="username"
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
                      items={Array.from(ROLES_MAP.keys())}
                      setValue={(value) =>
                        form.setValue('role', ROLES_MAP.get(value) as string)
                      }
                      value={ROLES_MAP.get(role) || 'Commerciale'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
