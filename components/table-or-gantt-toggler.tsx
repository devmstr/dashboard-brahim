import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function TabsDemo() {
  return (
    <Tabs defaultValue="table" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="gant">Gantt</TabsTrigger>
      </TabsList>
      <TabsContent value="table">
        {/* table view  */}
        <h1>Table View... </h1>
      </TabsContent>
      <TabsContent value="gant">
        {/* table view  */}
        <h1>Gantt View... </h1>
      </TabsContent>
    </Tabs>
  )
}
