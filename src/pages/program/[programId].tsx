import React, { useState } from 'react';
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import Program from "~/components/Program";
import Subjects from '~/components/Subjects';

const ProgramPage = () => {
    const router = useRouter();
    const { programId } = router.query;

    const [season, setSeason] = useState('Spring');
    const [year, setYear] = useState(1); // Set the initial year to the current year

    const selectedProgram = api.program.getProgramById.useQuery(String(programId));
    const program = selectedProgram.data ?? null;

    const handleSeasonToggle = () => {
        setSeason(season === 'Spring' ? 'Autumn' : 'Spring');
    };

    const handleButtonIndexChange = (index: number) => {
        // Handle the index change logic here
        setYear(index + 1);
    };

    if (!selectedProgram.isSuccess && (selectedProgram.isLoading || !program)) {
        // Loading state during the initial load
        return (
            <Layout>
                <div className="flex justify-center">
                    <p>Loading ...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col items-center justify-center mt-10">
                {program && (
                    <>
                        <Program
                            selectedProgram={program}
                            onButtonIndexChange={handleButtonIndexChange}
                        />
                        <button
                            onClick={handleSeasonToggle}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
                        >
                            Chosen Season: {season}
                        </button>
                    </>
                )}
            </div>
            <div className="mt-8">
                {program && (
                    <Subjects year={year} programCode={program?.studyprogCode} season={season} />
                )}
            </div>
        </Layout>
    );
};

export default ProgramPage;
