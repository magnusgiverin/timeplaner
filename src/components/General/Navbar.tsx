import Link from 'next/link';
import { useLanguageContext } from '~/contexts/languageContext';

const Navbar = () => {
  const { language, toggleLanguage } = useLanguageContext();

  const handleLanguageToggle: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    // You can include additional logic here if needed
    toggleLanguage();
  };

  return (
    <nav className="font-semibold p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/" className="mr-10">
          {language === 'en' ? 'Home' : 'Hjem'}
        </Link>
        <Link href="/about" className="mr-10">
          {language === 'en' ? 'About' : 'Om oss'}
        </Link>
        <Link href="/contact" className="mr-10">
          {language === 'en' ? 'Contact' : 'Kontakt'}
        </Link>
      </div>

      <div>
        <button onClick={handleLanguageToggle}>
          {language === 'en' ? 'Velg Norsk' : 'Choose English'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
