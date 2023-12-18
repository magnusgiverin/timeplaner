import React, { ReactNode } from 'react';
import Header from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      <main className="flex w-full flex-col items-center justify-center">
        <div className="w-1/2">{children}</div>
      </main>
    </div>
  );
};

export default Layout;