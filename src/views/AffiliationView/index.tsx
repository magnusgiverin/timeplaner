import BreakLine from "~/components/General/BreakLine";
import { useLanguageContext } from "~/contexts/languageContext";

const Affiliation = () => {
  const { language } = useLanguageContext();

  const affiliationText = language === 'no' ? 'Denne siden er ikke assosiert med NTNU' : 'This website is not affiliated with NTNU';

  return (
    <div className="fixed bottom-0 left-0 right-0 py-2">
      <p className="text-center text-small">
        {affiliationText}
      </p>
    </div>
  );
};

export default Affiliation;
