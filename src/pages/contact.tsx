import React from "react";
import BackButton from "~/components/General/BackButton";
import BreakLine from "~/components/General/BreakLine";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";

const About = () => {
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
                <BackButton />
            </div>
        </Layout>
    );
};

export default About;
