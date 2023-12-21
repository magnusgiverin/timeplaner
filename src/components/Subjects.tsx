import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Subject, StudyDirection, CourseGroup } from '~/interfaces/StudyPlanData';
import { api } from '~/utils/api';

interface SubjectsProps {
  year: number;
  programCode: string;
  season: string;
}

const getCurrentYear = () => new Date().getFullYear();

const isAutumnSeason = () => {
  const currentMonth = new Date().getMonth() + 1;
  const autumnStartMonth = 9; // September
  return currentMonth >= autumnStartMonth;
};

const LoadingIndicator: React.FC = () => (
  <div className="flex justify-center">
    <p>Loading ...</p>
  </div>
);

const RadioGroup: React.FC<{ options: StudyDirection[]; selected: string | null; onChange: (code: string) => void }> = ({
  options,
  selected,
  onChange,
}) => (
  <ul>
    {options.map((option) => (
      <li key={option.code}>
        <label>
          <input
            type="radio"
            name="studyDirection"
            value={option.code}
            checked={selected === option.code}
            onChange={() => onChange(option.code)}
          />
          {option.name}
        </label>
      </li>
    ))}
  </ul>
);

const StudyDirectionSubjects: React.FC<{ courseGroups: CourseGroup[]; title: string; studyChoiceFilter: (code: string) => boolean }> = ({
  courseGroups,
  title,
  studyChoiceFilter,
}) => (
  <div>
    <h3>{title}</h3>
    <ul>
      {courseGroups.map((courseGroup) => (
        // Use a fragment (<React.Fragment> or <>...</>) instead of an <li> for the outer container
        <React.Fragment key={courseGroup.code}>
          {courseGroup.courses
            .filter((subject) => studyChoiceFilter(subject.studyChoice.code))
            .map((subject) => (
              <li style={{ whiteSpace: 'nowrap' }} key={subject.code}>{`${subject.code} - ${subject.name} (${subject.studyChoice.code})`}</li>
            ))}
        </React.Fragment>
      ))}
    </ul>
  </div>
);

const Subjects: React.FC<SubjectsProps> = ({ year, programCode, season }) => {
  const autumnSeason = isAutumnSeason();
  const studyYear = autumnSeason ? getCurrentYear() - year + 1 : getCurrentYear() - year;
  const studyPlanId = `${programCode}-${studyYear}-${getCurrentYear()}`;

  const { data: studyPlan, isLoading: isStudyPlanLoading, refetch: refetchStudyPlan } =
    api.studyPlan.getStudyPlanById.useQuery(String(studyPlanId));

  const mutation = api.studyPlan.addStudyPlan.useMutation();
  const [mutationComplete, setMutationComplete] = useState(false);
  const [selectedStudyDirection, setSelectedStudyDirection] = useState<string | null>(null);

  const DISPLAYED_VALGBART_SUBJECTS_INITIAL = 5;

  const [displayedValgbartSubjects, setDisplayedValgbartSubjects] = useState(DISPLAYED_VALGBART_SUBJECTS_INITIAL);

  const [showMore, setShowMore] = useState(true);

  const router = useRouter();

  const handleStudyDirectionButtonPress = (studyPlanId: string, semester: number, studyDirection: string) => {
    // Replace the placeholders with the actual information you want to pass
    router.push({
      pathname: `/program/modify/${studyPlanId}/${semester}/${studyDirection}`
    });
  };

  useEffect(() => {
    // Reset displayedValgbartSubjects to 5 when year or studyDirection changes
    setDisplayedValgbartSubjects(5);
  }, [year, selectedStudyDirection, season]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!studyPlan && !isStudyPlanLoading && isMounted && !mutation.isLoading) {
        try {
          mutation.mutate(
            {
              studyProgCode: programCode,
              year: studyYear,
            },
            {
              onSuccess: () => {
                setMutationComplete(true);
                isMounted && refetchStudyPlan();
              },
            }
          );
        } catch (error) {
          console.error('Error invoking addStudyPlan mutation:', error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [year, isStudyPlanLoading, mutationComplete, studyPlan, refetchStudyPlan]);

  if (!studyPlan || isStudyPlanLoading) {
    return (
      <div>
        <h2>Subjects</h2>
        <LoadingIndicator />
      </div>
    );
  }

  const subjectsData = JSON.parse(studyPlan?.json_data) || [];
  const semester = season === 'Autumn' ? year * 2 - 2 : year * 2 - 1;
  const currentInfo = subjectsData.studyplan?.studyPeriods[semester]?.direction || [];
  const currentSubjects = currentInfo.courseGroups ? currentInfo.courseGroups[0].courses : [];

  return (
    <div className="flex justify-center'">
      <div>
        <h2>Subjects</h2>
        <ul>
          {currentSubjects.map((subject: Subject) => (
            <li style={{ whiteSpace: 'nowrap' }} key={subject.code}>{`${subject.code} - ${subject.name} (${subject.studyChoice.code})`}</li>
          ))}
          {currentSubjects.length !== 0 && (
            <button
              className='px-10 py-3 mt-5 rounded-xl bg-blue-500 text-white'
              onClick={() => {
                handleStudyDirectionButtonPress(studyPlanId, semester, currentInfo.courseGroups[0].code);
              }}
            >
              Modify Courses
            </button>

          )}
        </ul>

        {currentSubjects.length === 0 && (
          <>
            {currentInfo.studyWaypoints &&
              currentInfo.studyWaypoints[0]?.studyDirections.length > 0 && (
                <div>
                  <h3>Study Directions</h3>
                  <RadioGroup
                    options={currentInfo.studyWaypoints[0].studyDirections}
                    selected={selectedStudyDirection}
                    onChange={setSelectedStudyDirection}
                  />
                </div>
              )}

            {selectedStudyDirection && (
              <div>
                {hasSubjectsForCategory(
                  currentInfo.studyWaypoints[0].studyDirections,
                  selectedStudyDirection,
                  (subject: Subject) => !["VA", "V", "VB"].includes(subject.studyChoice.code)
                ) && (
                    <StudyDirectionSubjects
                      courseGroups={currentInfo.studyWaypoints[0].studyDirections
                        .filter((studyDirection: StudyDirection) => studyDirection.code === selectedStudyDirection)
                        .flatMap((filteredDirection: StudyDirection) => filteredDirection.courseGroups || [])}
                      title="Oblig"
                      studyChoiceFilter={(code) => !["VA", "V", "VB"].includes(code)}
                    />
                  )}

                {hasSubjectsForCategory(
                  currentInfo.studyWaypoints[0].studyDirections,
                  selectedStudyDirection,
                  (subject: Subject) => ["VA", "V", "VB"].includes(subject.studyChoice.code)
                ) && (
                    <div>
                      <h3>Valgbart</h3>
                      <ul>
                        {currentInfo.studyWaypoints[0].studyDirections
                          .filter((studyDirection: StudyDirection) => studyDirection.code === selectedStudyDirection)
                          .flatMap((filteredDirection: StudyDirection) => filteredDirection.courseGroups || [])
                          .flatMap((courseGroup: CourseGroup) => courseGroup.courses || [])
                          .filter((subject: Subject) => ["VA", "V", "VB"].includes(subject.studyChoice.code))
                          .slice(0, displayedValgbartSubjects)
                          .map((subject: Subject) => (
                            <li style={{ whiteSpace: 'nowrap' }} key={subject.code}>{`${subject.code} - ${subject.name} (${subject.studyChoice.code})`}</li>
                          ))}
                      </ul>
                      {currentInfo.studyWaypoints[0].studyDirections
                        .filter((studyDirection: StudyDirection) => studyDirection.code === selectedStudyDirection)
                        .flatMap((filteredDirection: StudyDirection) => filteredDirection.courseGroups || [])
                        .flatMap((courseGroup: CourseGroup) => courseGroup.courses || [])
                        .filter((subject: Subject) => ["VA", "V", "VB"].includes(subject.studyChoice.code))
                        .length > DISPLAYED_VALGBART_SUBJECTS_INITIAL && ( // Check if the number of subjects is greater than 5
                          <button
                            className='px-10 py-3 mt-5 rounded-xl bg-blue-500 text-white'
                            onClick={() => {
                              setDisplayedValgbartSubjects(() =>
                                showMore ? Number.MAX_SAFE_INTEGER : Math.min(5, /* max count */)
                              );
                              setShowMore(!showMore);
                            }}
                          >
                            {showMore ? 'Show More' : 'Show Less'}
                          </button>
                        )}
                    </div>
                  )}
                {selectedStudyDirection && (
                  <button
                    className='px-10 py-3 mb-5 mt-5 rounded-xl bg-blue-500 text-white'
                    onClick={() => {
                      handleStudyDirectionButtonPress(studyPlanId, semester, selectedStudyDirection);
                    }}
                  >
                    Modify Courses
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Subjects;

const hasSubjectsForCategory = (
  studyDirections: StudyDirection[],
  selectedDirection: string | null,
  studyChoiceFilter: (subject: Subject) => boolean
): boolean => {
  return (
    !!selectedDirection &&
    studyDirections.some(
      (studyDirection) =>
        studyDirection.code === selectedDirection &&
        studyDirection.courseGroups?.some((courseGroup) =>
          courseGroup.courses.some((subject) => studyChoiceFilter(subject))
        )
    )
  );
};