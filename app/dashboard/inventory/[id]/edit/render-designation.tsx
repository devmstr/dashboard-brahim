import React from 'react'

export function renderDesignation(designation: string | undefined) {
  const regex = /(?<=x)\d+|\d+(?=x)/gi
  const parts = designation?.split(regex)
  const matches = designation?.match(regex)

  return (
    <p className="text-muted-foreground truncate  overflow-hidden whitespace-nowrap">
      {parts?.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {matches && matches[index] && (
            <span className="font-bold text-primary">{matches[index]}</span>
          )}
        </React.Fragment>
      ))}
    </p>
  )
}
