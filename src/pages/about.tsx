import { useRouter } from "next/router";
import React from "react";
import BreakLine from "~/components/General/BreakLine";
import GreenButton from "~/components/General/GreenButton";
import Layout from "~/components/General/Layout";

const About = () => {
    const router = useRouter();

    const handleExploreClick = () => {
        // Redirect to the index page
        void router.push("/");
    };

    return (
        <Layout>
            <div className="mt-20">
                <h2 className="flex justify-center font-bold text-5xl my-4 pt-10">
                    Welcome to the NTNU Calendar App
                </h2>
            </div>
            <BreakLine />
            <h1 className="justify-center font text-xl text-align-left mt-10">
                <p>
                    This application is designed to help NTNU students manage their schedules more efficiently.
                </p>
                <p>
                    If you encounter any issues, have suggestions for improvements, or want to share your feedback, please don't hesitate to contact us.
                </p>
                <p>
                    Enjoy using the app!
                </p>
            </h1>
            <BreakLine />
            <div className="flex flex-col items-center justify-center mt-4">
                <GreenButton text={"Go back"} onClick={handleExploreClick} />
            </div>
        </Layout>
    );
};

export default About;
