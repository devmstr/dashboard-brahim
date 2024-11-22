import { Icons } from './icons'

interface LoadingProps {
  message?: string
  isLoading?: boolean
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  isLoading
}: LoadingProps) => {
  if (!isLoading) return null

  return (
    <div className="top-0 left-0 z-50 absolute h-screen w-screen flex flex-col gap-3 justify-center items-center">
      <div className="w-40 h-40 lg:w-56 lg:h-52 rounded-xl flex justify-center items-center bg-muted-foreground/10">
        <Icons.spinner className="animate-spin w-20 h-20 text-white opacity-90" />
      </div>
      <p className="text-muted-foreground/60 text-sm animate-pulse">
        {typeof message == 'string'
          ? message
          : 'Sorry ! something went wrong 404 error please refresh the page ...!'}
      </p>
    </div>
  )
}
