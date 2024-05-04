// utils/save_meal.ts
const saveAsMeal = async (nomen: string, datex: Date, selectedRows: Array<any>) => {
  console.log('saveAsMeal called with:', nomen, datex, selectedRows);
  
  
  const selectedMeals = selectedRows;

  const mealData = {
    name: nomen,
    date: datex,
    items: selectedMeals
  };

  console.log('mealData:', mealData);

  try {
    const response = await fetch('/api/saveMeal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealData),
    });


    console.log('Response received:', response);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();
    console.log('Response data:', data);

    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

export default saveAsMeal;