import React from "react";
import BreakLine from "~/components/General/BreakLine";
import Layout from "~/components/General/Layout";
import { useLanguageContext } from "~/contexts/languageContext";
import BackButton from "~/components/General/BackButton";

const About = () => {
    const { language } = useLanguageContext();

    const getTextHeader = () => {
        return language === "no" ? "Velkommen til NTNU sin Kalender App" : "Welcome to the NTNU Calendar App";
    };

    const getP1Header = () => {
        return language === "no"
            ? "Denne applikasjonen er designet for å hjelpe NTNU-studenter med å administrere timeplanene sine mer effektivt."
            : "This application is designed to help NTNU students manage their schedules more efficiently.";
    };

    const getContactInfo = () => {
        return language === "no"
            ? "Hvis du opplever problemer, har forslag til forbedringer, eller ønsker å dele tilbakemeldinger, nøl ikke med å kontakte oss.</p><p>Nyt bruken av appen!"
            : "If you encounter any issues, have suggestions for improvements, or want to share your feedback, please don't hesitate to contact us.</p><p>Enjoy using the app!";
    };

    return (
        <Layout>
            <div className="mt-20">
                <h2 className="flex justify-center font-bold text-5xl my-4 pt-10">
                    {getTextHeader()}
                </h2>
            </div>
            <BreakLine />
            <div className="justify-center font text-xl text-align-left mt-10">
                <p>{getP1Header()}</p>
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
