import type { ReactNode } from 'react';
import Header from './Navbar';
import { useMedia } from 'react-use';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isSmallScreen = useMedia('(max-width: 600px)'); // Adjust the maximum width as needed

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-col items-center mb-10">
        {isSmallScreen ? (<div className="w-full p-6">{children}</div>) : (<div className="w-2/3">{children}</div>)}
      </main>
    </div>
  );
};

export default Layout;
