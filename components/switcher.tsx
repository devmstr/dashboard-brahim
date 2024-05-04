import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn, toKebabCase } from '@/lib/utils'

interface SwitcherProps extends React.HTMLAttributes<HTMLDivElement> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
}

export function Switcher({
  label,
  checked,
  onCheckedChange,
  className
}: SwitcherProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        className={cn(className)}
        checked={checked}
        onCheckedChange={onCheckedChange}
        id={toKebabCase(label || 'id-label')}
      />
      {label && <Label htmlFor="airplane-mode">{label}</Label>}
    </div>
  )
}
