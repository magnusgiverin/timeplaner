import { useRouter } from 'next/router';
import Layout from '~/components/General/Layout';
import BreakLine from '~/components/General/BreakLine';
import { useLanguageContext } from '~/contexts/languageContext';
import Header from '~/components/Calendar/Header';

const CalSearchPage = () => {
    const router = useRouter();
    const { language } = useLanguageContext();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Check if the pressed key is Enter (key code 13)
        if (e.key === 'Enter') {
            // Redirect to SavePage with the username as a query parameter
            void router.push({
                pathname: '/save',
                query: { username: (e.target as HTMLInputElement).value.toLowerCase() },
            });
        }
    };

    const getHeader = () => {
        return language === "no" ? "Søk etter kalendere" :
            "Search for calendars"
    }

    const getSubText = () => {
        return language === "no" ? "Her kan du søke etter kalenderen som ble sist lagret på din maskin." :
            "Here you can search for the calendar which was most recently been saved on your machine."
    }

    const getExplainationText = () => {
        return language === "no" ? "Vi lagrer den nyteste kalenderen din direkte i nettleseren, dette tar circa 1MB med minne." :
            "We save your newest calendar directly in the web browser, this only takes about 1MB of storage space."
    }

    const getSearchText = () => {
        return language === "no" ? "Skriv inn ditt NTNU brukernavn" :
            "Enter your NTNU username:"
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
            <BreakLine />
            <div className='flex flex-col items-center mb-4'>
                <h3>{getSearchText()}</h3>
            </div>
            <div className='w-full flex flex-col items-center'>
                <input
                    className="text-black text-l h-9 rounded-md md:w-3/5 xl:w-2/5 text-center"
                    type="text"
                    placeholder={language === "no" ? "Skriv inn brukernavnet ditt" : "Enter your username"}
                    onKeyDown={handleSearch}
                />
            </div>
        </Layout>
    );
};

export default CalSearchPage;
