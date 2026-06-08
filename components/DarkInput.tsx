export default function DarkInput({ placeholder, value, onChange, type = 'text', className = '' }: any) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 text-[14px] transition-colors ${className}`}
      style={{ height: '48px', backgroundColor: '#101010', border: '1px solid #1E1E1E', borderRadius: '12px', color: '#E8E4DC' }}
    />
  )
}
