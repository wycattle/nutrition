// pages/nutrition_app.js
import nutrition_table from '../utils/nutrition_table.js';
import '../styles/styles.css'

export async function getServerSideProps() {
  const jsonData = await nutrition_table();

  console.log('jsonData: ', jsonData);
  console.log('jsonData 1st element value: ', jsonData[0]);

  return {
    props: {
      jsonData,
    },
  };
}

const NutritionApp = ({ jsonData }) => {
  return (
    <div>
      <h1>Nutrition Table</h1>
      <table>
        <thead>
          <tr>
            <th>Description 1</th>
            <th>Description 2</th>
            <th>Portion</th>
            <th>Calories</th>
            <th>Carb</th>
            <th>Fat</th>
            <th>Protein</th>
            <th>Fiber</th>
          </tr>
        </thead>
        <tbody>
          {jsonData.map((item, index) => (
            <tr key={index}>
              <td>{item.description_1}</td>
              <td>{item.description_2}</td>
              <td>{item.portion}</td>
              <td>{item.calories}</td>
              <td>{item.carb}</td>
              <td>{item.fat}</td>
              <td>{item.protein}</td>
              <td>{item.fiber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NutritionApp;