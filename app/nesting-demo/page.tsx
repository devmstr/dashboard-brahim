// app/nesting-demo/page.tsx

import { NestingDemo } from '@/components/nesting-demo'

export default function NestingDemoPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">2D Nesting Demo</h1>
      <p className="text-sm text-gray-500">
        Compute how many identical rectangles fit on a metal sheet using
        MaxRects.
      </p>
      <NestingDemo />
    </main>
  )
}
