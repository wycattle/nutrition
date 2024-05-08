// utils/save_recipe.ts
const saveAsRecipe = async (nomen: string, datex: Date, selectedRows: Array<any>, per100g: any) => {
    console.log('saveAsRecipe called with:', nomen, datex, selectedRows, per100g);
    
    
    const selectedRecipes = selectedRows;
  
    const recipeData = {
      name: nomen,
      date: datex,
      items: selectedRecipes,
      per100g: per100g 
    };
  
    console.log('recipeData:', recipeData);
  
    try {
      const response = await fetch('/api/saveRecipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
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
  
  export default saveAsRecipe;