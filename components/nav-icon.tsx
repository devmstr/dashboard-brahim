'use client'

interface BurgerButtonProps {
  state: boolean
}
export const BurgerMenu: React.FC<BurgerButtonProps> = ({ state }) => {
  return (
    <div className={`menu-btn ${state ? 'open' : ''}`}>
      <div className={'menu-btn__burger'} />
    </div>
  )
}
