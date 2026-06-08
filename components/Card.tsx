export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div
      className={`mx-4 mb-3 rounded-2xl overflow-hidden ${className}`}
      style={{ backgroundColor: '#141414', border: '1px solid #1E1E1E' }}
    >
      {children}
    </div>
  )
}
