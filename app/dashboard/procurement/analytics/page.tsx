import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Page = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyses & indicateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Espace des analyses et indicateurs.
        </p>
      </CardContent>
    </Card>
  )
}

export default Page
