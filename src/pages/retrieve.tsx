import Layout from '~/components/General/Layout';
import BreakLine from '~/components/General/BreakLine';
import { useLanguageContext } from '~/contexts/languageContext';
import Header from '~/components/General/Header';
import SavedComponents from '~/components/SavePage/SavedComponents';
import BackButton from "~/components/General/BackButton";
import { useRouter } from 'next/router';

const RetreivePage = () => {
    const { language } = useLanguageContext();
    const router = useRouter();

    const getHeader = () => {
        return language === "no" ? "Hent tidligere kalendere" :
            "Retrieve past calendars"
    }

    const getSubText = () => {
        return language === "no" ? "Her kan du gjenhente kalenderene som har blitt lagret på din maskin." :
            "Here you can retrieve the calendars which have been saved on your machine."
    }

    const getExplainationText = () => {
        return language === "no" ? "Vi lagrer kalenderen din direkte i nettleseren, dette tar circa 1MB med minne per kalender." :
            "We save your calendar directly in the web browser, this only takes about 1MB of storage space per calendar."
    }

    return (
        <Layout>
            <Header label={getHeader()} />
            <BreakLine />
            <div className="justify-center font text-xl text-align-left mt-10 mb-4">
                <p>{getSubText()}</p>
            </div>
            <div className="justify-center font text-xl text-align-left mt-10 mb-4">
                <p>{getExplainationText()}</p>
            </div>
            <SavedComponents></SavedComponents>
            <BreakLine />
            <div className="flex flex-col items-center justify-center">
                <BackButton
                    buttonText={language === "no" ? "Lag ny kalender" : "Make a new calendar"}
                    redirect={() => {
                        void router.push({
                            pathname: '/',
                        });
                    }}
                />
            </div>
        </Layout>
    );
};

export default RetreivePage;
