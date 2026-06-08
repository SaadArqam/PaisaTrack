import Link from 'next/link'
export default function SectionHeader({ title, cta, href }: { title: string, cta?: string, href?: string }) {
  return (
    <div className="flex justify-between items-center px-4 mb-2.5">
      <span className="text-[10px] font-semibold tracking-[1.2px] uppercase" style={{ color: '#444' }}>
        {title}
      </span>
      {cta && href && (
        <Link href={href} className="text-[11px] font-medium" style={{ color: '#E8B84B' }}>
          {cta}
        </Link>
      )}
    </div>
  )
}
