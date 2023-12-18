// pages/program/[programId].js
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { useRouter } from 'next/router';
import Program from "~/components/Program";

const ProgramPage = () => {
    const router = useRouter();
    const { programId } = router.query;

    const selectedProgram = api.program.getProgramById.useQuery(String(programId));
    const program = selectedProgram.data ?? null;

    if (!program) {
        // Handle the case where the course is not found
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
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '70vh',
                }}
            >
                <Program selectedProgram={program} />
            </div>
        </Layout>
    );
};
    
export default ProgramPage;
