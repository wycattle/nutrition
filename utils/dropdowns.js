// /utils/dropdowns.js
import nutrition_table from '../nutrition_table.js';

const createDropdown = async () => {

  const nutrition_json = await nutrition_table
  // Get unique names from 'description_1' column
  const uniqueNames = [...new Set(nutrition_json.map(item => item.description_1))];

  // Create dropdown
  let dropdown = document.createElement('select');
  uniqueNames.forEach(name => {
    let option = document.createElement('option');
    option.value = name;
    option.text = name;
    dropdown.appendChild(option);
  });

  // Append dropdown to the body of the page
  document.body.appendChild(dropdown);
};

createDropdown();