import { useRouter } from 'next/router';

interface BackButtonProps {
  buttonText?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ buttonText = '< Back' }) => {
  const router = useRouter();

  return (
    <button
      className='px-6 py-3 m-2 rounded-xl bg-blue-500 text-white'
      onClick={() => router.back()}
    >
      {buttonText}
    </button>
  );
};

export default BackButton;


