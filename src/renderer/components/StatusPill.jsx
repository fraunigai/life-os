import React from 'react'

const STATUS_MAP = {
  not_started:  { label: 'Not started', bg: 'bg-[rgb(var(--c-x-statuspill-idle-tint))]', text: 'text-text-muted' },
  in_progress:  { label: 'In progress', bg: 'bg-teal-light',    text: 'text-teal-med'   },
  done:         { label: 'Done',        bg: 'bg-green-done/10', text: 'text-green-done' },
  blocked:      { label: 'Blocked',     bg: 'bg-danger-tint',   text: 'text-danger'     },
}

export default function StatusPill({ status }) {
  const { label, bg, text } = STATUS_MAP[status] || STATUS_MAP.not_started
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${bg} ${text}`}>
      {label}
    </span>
  )
}
