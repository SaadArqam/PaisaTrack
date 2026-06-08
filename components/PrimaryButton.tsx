export default function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 font-semibold text-[14px] active:scale-[0.98] transition-transform"
      style={{
        height: '52px',
        backgroundColor: '#E8B84B',
        borderRadius: '13px',
        color: '#0C0C0C',
        border: 'none',
        fontFamily: 'var(--font-outfit)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
