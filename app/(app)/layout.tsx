import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';
import { Navbar } from '@/components/app/navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {
  const hdrs = await headers();
  const { companyName, logo, logoDark } = await getAppConfig(hdrs);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 hidden w-full flex-row justify-between p-6 md:flex">
        <div><Navbar /></div>
        <span className="text-foreground font-mono text-xs font-bold tracking-wider uppercase">
          Talk with{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents"
            className="underline underline-offset-4"
          >
            JOINT.AI
          </a>
        </span>
      </header>

      {children}
    </>
  );
}
