'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const tabs = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/quiz', icon: '📝', label: 'Quiz' },
  { href: '/mock-test', icon: '🏆', label: 'Mock Test' },
  { href: '/study-materials', icon: '🛒', label: 'Market' },
  { href: '/my-progress', icon: '📊', label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '1px solid #e2e8f0',
      display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '8px 4px', textDecoration: 'none',
            color: active ? '#6366f1' : '#94a3b8',
            borderTop: active ? '2px solid #6366f1' : '2px solid transparent',
          }}>
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span style={{ fontSize: '10px', marginTop: '2px', fontWeight: active ? '700' : '400' }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

