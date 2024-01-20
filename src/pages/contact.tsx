import React from "react";
import BackButton from "~/components/General/BackButton";
import BreakLine from "~/components/General/BreakLine";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";
import Header from '~/components/General/Header';

const About = () => {
    const { language } = useLanguageContext();
    
    const getTextHeader = () => {
        return language === "no" ? "Kontaktinformasjon kommer" : "Contact information will come";
      };

    return (
        <Layout>
            <Header label={getTextHeader()}/>
            <BreakLine />
            <div className="flex flex-col items-center justify-center">
                <BackButton />
            </div>
        </Layout>
    );
};

export default About;
