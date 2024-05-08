// utils/save_per100gRecipe.ts
const saveAsPer100gRecipe = async (per100g: any) => {
    console.log('saveAsPer100gRecipe called with:', per100g);
  
    const per100gData = {
      name: per100g.name,
      portion: per100g.portion,
      calories: per100g.calories,
      carb: per100g.carb,
      fat: per100g.fat,
      protein: per100g.protein,
      fiber: per100g.fiber,
    };
  
    console.log('per100gData:', per100gData);
  
    try {
      const response = await fetch('/api/savePer100gRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(per100gData),
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
  
  export default saveAsPer100gRecipe;