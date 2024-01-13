import { useRouter } from 'next/router';
import { useLanguageContext } from '~/contexts/languageContext';

interface BackButtonProps {
  buttonText?: string;
  redirect?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ buttonText, redirect }) => {
  const router = useRouter();
  const { language } = useLanguageContext();

  const standardButtonLabel = language === 'no' ? 'Gå tilbake' : 'Back';
  const buttonLabel = buttonText ? buttonText : standardButtonLabel;

  const handleButtonClick = () => {
    if (redirect) {
      redirect()
    } else {
      router.back();
    }
  };

  return (
    <button
      className='px-6 py-3 m-2 flex items-center rounded-full bg-green-500 text-white'
      onClick={handleButtonClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 mr-2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      {buttonLabel}
    </button>
  );
};

export default BackButton;
