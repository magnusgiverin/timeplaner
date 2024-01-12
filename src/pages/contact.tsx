import { useRouter } from "next/router";
import React from "react";
import BreakLine from "~/components/General/BreakLine";
import GreenButton from "~/components/General/GreenButton";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";

const About = () => {
    const router = useRouter();

    const handleExploreClick = () => {
        // Redirect to the index page
        void router.back()
    };
    
    const getButtonLabel = () => {
        return language === "no" ? "Gå tilbake" : "Go back"
    }

    const { language } = useLanguageContext();
    
    const getTextHeader = () => {
        return language === "no" ? "Kontaktinformasjon kommer" : "Contact information will come";
      };

    return (
        <Layout>
            <div className="mt-20">                
                <h2 className="flex justify-center font-bold text-5xl my-4 pt-10">
                    {getTextHeader()}
                </h2>
            </div>
            <BreakLine />
            <div className="flex flex-col items-center justify-center">
                <GreenButton text={getButtonLabel()} onClick={handleExploreClick}/>
            </div>
        </Layout>
    );
};

export default About;
