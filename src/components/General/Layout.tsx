import type { ReactNode } from 'react';
import Header from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-col items-center mb-10">
        <div className="w-2/3">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
