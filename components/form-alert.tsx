'use client'

import type React from 'react'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

interface FormAlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  className?: string
}

export function FormAlert({
  type,
  title,
  message,
  className = ''
}: FormAlertProps) {
  const alertConfig = {
    success: {
      icon: CheckCircle2,
      className: 'border-green-200 bg-green-50 text-green-800'
    },
    error: {
      icon: AlertCircle,
      className: 'border-red-200 bg-red-50 text-red-800'
    },
    warning: {
      icon: AlertTriangle,
      className: 'border-yellow-200 bg-yellow-50 text-yellow-800'
    },
    info: {
      icon: Info,
      className: 'border-blue-200 bg-blue-50 text-blue-800'
    }
  }

  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <Alert className={`${config.className} ${className}`}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export default function Component() {
  const [alertType, setAlertType] = useState<
    'success' | 'error' | 'warning' | 'info' | null
  >('info')
  const [alertMessage, setAlertMessage] = useState(
    'Please fill out all required fields to continue.'
  )

  const showAlert = (
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => {
    setAlertType(type)
    setAlertMessage(message)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    showAlert(
      'success',
      'Form submitted successfully! Your information has been saved.'
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Contact Form</CardTitle>
        <CardDescription>
          Fill out the form below to get in touch with us.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form Alert - appears before all form items */}
        {alertType && (
          <FormAlert
            type={alertType}
            title={
              alertType === 'error'
                ? 'Error'
                : alertType === 'success'
                ? 'Success'
                : alertType === 'warning'
                ? 'Warning'
                : 'Information'
            }
            message={alertMessage}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                required
                onInvalid={() =>
                  showAlert('error', 'Please enter your first name.')
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                required
                onInvalid={() =>
                  showAlert('error', 'Please enter your last name.')
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              onInvalid={() =>
                showAlert('error', 'Please enter a valid email address.')
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select required onValueChange={() => setAlertType(null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="support">Technical Support</SelectItem>
                <SelectItem value="billing">Billing Question</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              rows={4}
              required
              onInvalid={() => showAlert('error', 'Please enter your message.')}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Send Message
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                showAlert(
                  'warning',
                  'Are you sure you want to clear all fields?'
                )
              }
            >
              Clear
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                showAlert(
                  'info',
                  'This form uses secure encryption to protect your data.'
                )
              }
            >
              Info
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
