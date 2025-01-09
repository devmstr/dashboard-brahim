import { useServerUser } from '@/hooks/useServerUser'
import { Avatar, AvatarImage } from '@ui/avatar'
import { Icons } from './icons'
import { User } from 'next-auth'

interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string | null
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ image, ...props }) => {
  return (
    <Avatar {...props}>
      <AvatarImage
        className="w-full h-full object-cover object-center"
        alt="PfP Picture"
        src={image || '/images/default-pfp.svg'}
      />
    </Avatar>
  )
}
