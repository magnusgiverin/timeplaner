import React, { useEffect, useState } from 'react';
import type { SavedData } from '~/pages/saved';
import BreakLine from "~/components/General/BreakLine";
import { useLanguageContext } from "~/contexts/languageContext";
import { useRouter } from 'next/router';

interface StorageData {
  key: string;
  data: SavedData;
}

const isSavedData = (data: unknown): data is SavedData => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const keys = Object.keys(data);

  return (
    'selectedSemesterPlans' in data &&
    'semesterPlans' in data &&
    'currentCourses' in data &&
    'courseColors' in data &&
    'indexes' in data &&
    'season' in data &&
    'programCode' in data &&
    'year' in data &&
    keys.length === 8
  );
};

const SavedComponents: React.FC = () => {
  const [saved, setSaved] = useState<StorageData[]>([]);
  const { language } = useLanguageContext();
  const router = useRouter();

  useEffect(() => {
    // This code will run on the client side after the component mounts

    // Function to retrieve all items from localStorage
    const getAllItemsFromLocalStorage = (): StorageData[] => {
      const storageData: StorageData[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsedItem: StorageData = JSON.parse(item) as StorageData;
              if (isSavedData(parsedItem)) {
                storageData.push({ key, data: parsedItem.data });
              }
            } catch (error) {
              console.error(`Error parsing item with name '${key}' from localStorage:`, error);
            }
          }
        }
      }

      return storageData;
    };

    // Example usage
    setSaved(getAllItemsFromLocalStorage());
  }, []); // Empty dependency array ensures the effect runs once after mount

  const handleDelete = (key: string) => {
    const confirmationMessage =
      language === 'no'
        ? `Er du sikker på at du vil slette kalenderen med navnet: ${key}?\nDu kan ikke angre denne avgjørelsen.`
        : `Are you sure you want to delete the calendar named: ${key}?\nThis cannot be undone.`;

    const isConfirmed = window.confirm(confirmationMessage);

    // If the user confirms, proceed with deletion
    if (isConfirmed) {
      // Function to delete an item from localStorage
      localStorage.removeItem(key);

      // Update the state to re-render without the deleted item
      setSaved((prevSaved) => prevSaved.filter((item) => item.key !== key));
    }
  };

  return (
    <div>
      {saved && saved.length > 0 && (
        <div>
          <BreakLine />
          <h3>{language === 'no' ? 'Dine lagrede kalendere:' : 'Your saved calendars:'}</h3>
          {saved
            .sort((a, b) => a.key.localeCompare(b.key)) // Sort the keys alphabetically
            .map((item) => (
              <div className="flex flex-row inline-block mt-2" key={item.key}>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  onClick={() => {
                    void router.push({
                      pathname: '/saved',
                      query: { key: item.key },
                    });
                  }}
                >
                  {item.key}
                </button>
                <a
                  className="rounded-md transition duration-300 ease-in-out hover:bg-red-500 ml-2 mt-2 mb-2"
                  onClick={() => handleDelete(item.key)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 18L18 6M6 6l12 12" />
                  </svg>
                </a>
                <a
                  className="rounded-md transition duration-300 ease-in-out hover:bg-green-500 ml-2 mt-2 mb-2"
                  onClick={() => {
                    void router.push({
                      pathname: '/saved',
                      query: { key: item.key },
                    });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </a>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SavedComponents;
