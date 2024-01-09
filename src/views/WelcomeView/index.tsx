import BreakLine from "~/components/General/BreakLine";
import { useLanguageContext } from "~/contexts/languageContext";


const Welcome = () => {
  const { language } = useLanguageContext();

  const welcomeText = language === 'en' ? 'Welcome to TimePlanner!' : 'Velkommen til TimePlaner!';

  return (
    <div className="mt-20">
      <h2 className="flex justify-center font-bold text-5xl my-4 pt-10">
        {welcomeText}
      </h2>
      <BreakLine />
    </div>
  );
};

export default Welcome;
