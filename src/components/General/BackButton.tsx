import { useRouter } from 'next/router';
import { useLanguageContext } from '~/contexts/languageContext';

interface BackButtonProps {
  buttonText?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ buttonText }) => {
  const router = useRouter();
  const { language } = useLanguageContext();

  const standardButtonLabel = language === "no" ? "< Gå tilbake" : "< Back"
  const buttonLabel = buttonText ? buttonText : standardButtonLabel

  return (
    <button
      className='px-6 py-3 m-2 rounded-xl bg-blue-500 text-white'
      onClick={() => router.back()}
    >
      {buttonLabel}
    </button>
  );
};

export default BackButton;


