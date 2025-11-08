import React from 'react'
import './VineBorder.css'

interface VineBorderProps {
  children: React.ReactNode
}

const VineBorder: React.FC<VineBorderProps> = ({ children }) => {
  return (
    <div className="vine-border-container">
      <div className="vine-border-top"></div>
      <div className="vine-border-right"></div>
      <div className="vine-border-bottom"></div>
      <div className="vine-border-left"></div>
      <div className="vine-border-content">
        {children}
      </div>
    </div>
  )
}

export default VineBorder
