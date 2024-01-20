import React from "react";
import BreakLine from "~/components/General/BreakLine";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";
import BackButton from "~/components/General/BackButton";
import Header from '~/components/General/Header';

const About = () => {
    const { language } = useLanguageContext();

    const getTextHeader = () => {
        return language === "no" ? "Hva er TimePlaner.net?" : "What is TimePlaner.net?";
    };

    const getP1Header = () => {
        return language === "no"
            ? "Denne applikasjonen er designet for å hjelpe NTNU-studenter med å administrere timeplanene sine mer effektivt."
            : "This application is designed to help NTNU students manage their schedules more efficiently.";
    };

    const getContactInfo = () => {
        return language === "no"
            ? "Hvis du opplever problemer, har forslag til forbedringer, eller ønsker å dele tilbakemeldinger, nøl ikke med å kontakte oss. Nyt bruken av appen!"
            : "If you encounter any issues, have suggestions for improvements, or want to share your feedback, please don't hesitate to contact us. Enjoy using the app!";
    };

    return (
        <Layout>
            <Header label={getTextHeader()}/>
            <BreakLine />
            <div className="justify-center font text-xl text-align-left mt-10">
                <p>{getP1Header()}</p>
            </div>
            <div className="justify-center font text-xl text-align-left mt-10">
                <p>{getContactInfo()}</p>
            </div>
            <BreakLine />
            <div className="flex flex-col items-center justify-center">
                <BackButton />
            </div>
        </Layout>
    );
};

export default About;
