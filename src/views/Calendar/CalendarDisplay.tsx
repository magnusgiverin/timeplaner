import React, { useEffect, useState } from 'react';
import { useAppContext } from '~/contexts/appContext';
import { SemesterPlan } from '~/interfaces/SemesterPlanData';
import { api } from '~/utils/api';
import { generateICal, downloadICal } from './GenerateIcal';
import GreenButton from '../../components/General/GreenButton';
import IcsCalendar from './IcsCalendar';

interface CalendarDisplayProps {
  subjectList: Array<string | undefined>;
}

const CalendarDisplay: React.FC<CalendarDisplayProps> = ({ subjectList }) => {
  const { season } = useAppContext();
  const [semesterPlans, setSemesterPlans] = useState<SemesterPlan[]>([]);
  const [ical, setIcal] = useState<string>("");
  
  const mutation = api.semesterPlan.getSemesterPlan.useMutation();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const currentYearLastDigits = new Date().getFullYear().toString().slice(-2);
        const currentSemester = `${currentYearLastDigits}${season === 'Spring' ? 'v' : 'h'}`;

        const response = await mutation.mutateAsync({
          subjectCodes: subjectList.map(subjectCode => subjectCode || ''),
          semester: currentSemester,
        });

        if (isMounted) {
          setSemesterPlans(response);
        }
      } catch (error) {
        console.error('Error fetching semester plans:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [subjectList, season]);

  useEffect(() => {
    const iCalContent = generateICal(semesterPlans);
    setIcal(iCalContent);

  }, [semesterPlans]);

  const handleDownload = () => {
    downloadICal(ical, 'calendar.ics');
  };  
  
  return (
    <div>
      <GreenButton onClick={handleDownload} text={'Download ICS'}/>
      {/* <GreenButton onClick={handleDownload} text={''} className='ml-2'/>  */}
      <div className='mt-2 mb-2'>
        {ical && <IcsCalendar icsFileContent={ical} />}
      </div>
    </div>
  );
};

export default CalendarDisplay;
