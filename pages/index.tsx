import React from 'react';
import Meal from './meal/Meal';

const IndexPage = () => {
  return <Meal />;
};

export default IndexPage;



// import React, { useState, useEffect } from 'react';
// import Select from 'react-dropdown-select';
// import axios from 'axios';
// import Link from 'next/link';
// import styles from '../styles/Meal_styles.module.scss';
// import { IOption, IMealDetail, IMealx, IRecipex } from '../utils/interfaces';
// import IndexView from './index_view';

// //state initialization of hooks
// const Meal = () => {
//   const [dropdownOptions,       setDropdownOptions]       = useState<IOption[]>([]);
//   const [dropdownSelectedValue, setDropdownSelectedValue] = useState<IOption | null>(null);
//   const [data,                  setData]                  = useState<IMealDetail[]>([]);
//   const [portionSize,           setPortionSize]           = useState<number>(1);
//   const [selectedRows,          setSelectedRows]          = useState<IMealDetail[]>([]);
//   const [totals,                setTotals]                = useState({
//     portionTot: 0,
//     caloriesTot: 0,
//     carbTot: 0,
//     fatTot: 0,
//     proteinTot: 0,
//     fiberTot: 0,
//   });
//   const [namex,                 setName]                  = useState<string>('');
//   const [message,               setMessage]               = useState<string>('');
//   const [showNameInput,         setShowNameInput]         = useState(false);


//   // component function body
//   useEffect(() => {
//     axios.get('/api/nutrition')
//       .then(response => {
//         setData(response.data || []);
//         const uniqueValues = Array.from(new Set((response.data || []).map((item: IMealDetail) => item.desc1)));
//         setDropdownOptions(uniqueValues.map((value: string) => ({ label: value, value })));
//       })
//       .catch(error => {
//         setMessage('Error fetching data');
//       });
//   }, []);

//   useEffect(() => {
//     if (selectedRows.length > 0) {
//       const newTotals = selectedRows.reduce((acc, curr) => ({
//         portionTot: acc.portionTot + (curr.portion ?? 0),
//         caloriesTot: acc.caloriesTot + (curr.calories ?? 0),
//         carbTot: acc.carbTot + (curr.carb ?? 0),
//         fatTot: acc.fatTot + (curr.fat ?? 0),
//         proteinTot: acc.proteinTot + (curr.protein ?? 0),
//         fiberTot: acc.fiberTot + (curr.fiber ?? 0),
//       }), {
//         portionTot: 0,
//         caloriesTot: 0,
//         carbTot: 0,
//         fatTot: 0,
//         proteinTot: 0,
//         fiberTot: 0,
//       });
//       setTotals(newTotals);
//     } else {
//       setTotals({
//         portionTot: 0,
//         caloriesTot: 0,
//         carbTot: 0,
//         fatTot: 0,
//         proteinTot: 0,
//         fiberTot: 0,
//       });
//     }
//   }, [selectedRows]);



//   const handleRowSelect = (item: IMealDetail) => {
//     const updatedRow = {
//       ...item,
//       portion: portionSize,
//       calories: (item.calories || 0) * portionSize,
//       carb: (item.carb || 0) * portionSize,
//       fat: (item.fat || 0) * portionSize,
//       protein: (item.protein || 0) * portionSize,
//       fiber: (item.fiber || 0) * portionSize,
//     };
//     setSelectedRows(prev => [...prev, updatedRow]);
//   };

//   const handleRemoveRow = (index: number) => {
//     setSelectedRows(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSaveAsMeal = () => {
//     setShowNameInput(true);
//     if (!namex.trim()) {
//       setMessage('Please enter a name for the meal.');
//       return;
//     }
//     const mealx: IMealx = {
//       name: namex,
//       date: new Date(),
//       details: selectedRows,
//     };
//     axios.post('/api/meal_related/create_meal', mealx)
//       .then(response => {
//         setMessage('Meal created successfully');
//         setSelectedRows([]);
//         setName('');
//       })
//       .catch(() => setMessage('Error creating meal'));
//   };

//   const handleSaveAsRecipe = () => {
//     setShowNameInput(true);
//     if (!namex.trim()) {
//       setMessage('Please enter a name for the recipe.');
//       return;
//     }
//     const newRecipe: IRecipex = {
//       name: namex,
//       details: selectedRows,
//     };
//     axios.post('/api/recipe_related/create_recipe', newRecipe)
//       .then(() => {
//         setMessage('Recipe created successfully');
//         setSelectedRows([]);
//         setName('');
//       })
//       .catch(() => setMessage('Error creating recipe'));
//   };

//   return (
//     <div className={styles['page-root']}>
//       <Link href="/">
//         <span className={styles['back-to-home-page']}>Back to Home Page</span>
//       </Link>

//       <div className={styles['select-food-group-container']}>
//         <label htmlFor="select-food-group-item" className={styles['select-food-group-item-labelStyle']}>
//           Select a food group
//         </label>
//         <Select
//           options={dropdownOptions}
//           onChange={values => setDropdownSelectedValue(values[0])}
//           values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
//         />
//       </div>

//       {dropdownSelectedValue && (
//         <table className={styles['table-style']}>
//           <thead>
//             <tr>
//               <th>Select</th>
//               <th>Desc 1</th>
//               <th>Desc 2</th>
//               <th>Portion</th>
//               <th>Calories</th>
//               <th>Carb</th>
//               <th>Fat</th>
//               <th>Protein</th>
//               <th>Fiber</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.filter(item => item.desc1 === dropdownSelectedValue.value).map((item, idx) => (
//               <tr key={idx}>
//                 <td>
//                   <button onClick={() => handleRowSelect(item)}>Add</button>
//                 </td>
//                 <td>{item.desc1}</td>
//                 <td>{item.desc2}</td>
//                 <td>{item.portion}</td>
//                 <td>{item.calories}</td>
//                 <td>{item.carb}</td>
//                 <td>{item.fat}</td>
//                 <td>{item.protein}</td>
//                 <td>{item.fiber}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       <div className={styles['portion-container']}>
//         <label htmlFor="portionSize">Enter portion size:</label>
//         <input
//           id="portionSize"
//           className={styles['portion-size-inputbox']}
//           type="number"
//           min={1}
//           value={portionSize}
//           onChange={e => setPortionSize(Number(e.target.value))}
//         />
//       </div>

//       <h2 className={styles.h2}>Selected Rows</h2>
//       <table className={styles['table-style']}>
//         <thead>
//           <tr>
//             <th>Remove</th>
//             <th>Desc 1</th>
//             <th>Desc 2</th>
//             <th>Portion</th>
//             <th>Calories</th>
//             <th>Carb</th>
//             <th>Fat</th>
//             <th>Protein</th>
//             <th>Fiber</th>
//           </tr>
//         </thead>
//         <tbody>
//           {selectedRows.map((item, idx) => (
//             <tr key={idx}>
//               <td>
//                 <button onClick={() => handleRemoveRow(idx)}>Remove</button>
//               </td>
//               <td>{item.desc1}</td>
//               <td>{item.desc2}</td>
//               <td>{item.portion}</td>
//               <td>{item.calories}</td>
//               <td>{item.carb}</td>
//               <td>{item.fat}</td>
//               <td>{item.protein}</td>
//               <td>{item.fiber}</td>
//             </tr>
//           ))}
//           <tr>
//             <td>Totals</td>
//             <td></td>
//             <td></td>
//             <td>{totals.portionTot}</td>
//             <td>{totals.caloriesTot}</td>
//             <td>{totals.carbTot}</td>
//             <td>{totals.fatTot}</td>
//             <td>{totals.proteinTot}</td>
//             <td>{totals.fiberTot}</td>
//           </tr>
//         </tbody>
//       </table>

//       {selectedRows.length > 0 && (
//         <>
//           {showNameInput && (
//             <div className={styles['name-it-box']}>
//               <label htmlFor="nameItBox">Give it a name:</label>
//               <input
//                 id="nameItBox"
//                 className={styles['name-it-box-inputStyle']}
//                 type="text"
//                 value={namex}
//                 onChange={e => setName(e.target.value)}
//                 placeholder="fill me in"
//               />
//             </div>
//           )}
//           <div>
//             <button
//               id="saveAsMealButton"
//               className={styles['saveAsMealButtonStyle']}
//               onClick={handleSaveAsMeal}
//             >
//               Save as Meal
//             </button>
//           </div>
//           <div>
//             <button
//               id="saveAsRecipeButton"
//               className={styles['saveAsRecipeButtonStyle']}
//               onClick={handleSaveAsRecipe}
//             >
//               Save as Recipe
//             </button>
//           </div>
//         </>
//       )}

//       {message && <div className={styles['alert-popup2']}>{message}</div>}
//     </div>
//   );
// };

// export default Meal;