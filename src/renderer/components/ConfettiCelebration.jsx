import React, { useEffect } from 'react'
import { tokenHex } from '../utils/colors'

export default function ConfettiCelebration({ trigger }) {
  useEffect(() => {
    if (!trigger) return
    let confetti
    import('canvas-confetti').then(mod => {
      confetti = mod.default
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        // canvas-confetti needs hex, so resolve the live theme tokens at fire time
        colors: ['primary', 'amber', 'purple', 'ink', 'tint'].map(name => tokenHex(name)),
      })
    })
  }, [trigger])

  return null
}
