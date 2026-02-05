import React from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import { IOption, IMealDetail } from '../../types_interfaces/interfaces';
import styles from '../../styles/Meal_styles.module.scss';
import { Meal_View_Props } from '../../types_interfaces/interfaces';


//React.FC is FunctionComponent:  A React function component is
//a plain JavaScript function that accepts properties ("props") as an argument 
// and returns a React element (JSX)
const Meal_View: React.FC<Meal_View_Props & { nutrientCalories: { carbCalories: number; fatCalories: number; proteinCalories: number; grandTotal: number } }> = ({
  dropdownOptions,
  dropdownSelectedValue,
  setDropdownSelectedValue,
  data,
  dropdownCheckedRows,
  setDropdownCheckedRows,
  handleRowSelect,
  portionSize,
  setPortionSize,
  isBlinking,
  handleApplyPortion,
  selectedRows,
  handleCheckboxChange,
  totals,
  nutrientCalories,
  showNameInput,
  namex,
  setName,
  handleSaveAsMeal,
  handleSaveAsRecipe,
  message,
}) => (


  <div className={styles['page-root']}>
    <div>
      <Link href="/">
        <span className={styles['back-to-home-page']}>Back to Home Page</span>
      </Link>
    </div>

    <div className={styles['select-food-group-container']}>
      <label htmlFor="select-food-group-item">
        Select a food group
      </label>
      <div id="select-food-group-item">
        <Select
          options={dropdownOptions}
          onChange={(newValue) => {
            setDropdownSelectedValue(newValue[0]);
          }}
          values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
        />
      </div>
    </div>

    {dropdownSelectedValue && (
      <table className={styles['table-style']}>
        <thead className={styles['table-style']}>
          <tr>
            <th>Select</th>
            <th>Desc 1</th>
            <th>Desc 2</th>
            <th>Portion</th>
            <th>Calories</th>
            <th>Carb</th>
            <th>Fat</th>
            <th>Protein</th>
            <th>Fiber</th>
          </tr>
        </thead>
        <tbody>
          {data.filter(item => item.desc1 === dropdownSelectedValue.value).map((item, index) => (
            <tr key={index}>
              <td style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  style={{ transform: "scale(2)" }}
                  checked={dropdownCheckedRows.has(index)}
                  onChange={() => {
                    handleRowSelect(item);
                    if (dropdownCheckedRows.has(index)) {
                      dropdownCheckedRows.delete(index);
                    } else {
                      dropdownCheckedRows.add(index);
                    }
                    setDropdownCheckedRows(new Set(dropdownCheckedRows));
                  }}
                />
              </td>
              <td>{item.desc1}</td>
              <td>{item.desc2}</td>
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
    )}

    <div className={styles['portion-container']}>
      <label htmlFor="portionSize">
        enter a portion size number and click Enter
      </label>
      <input
        id="portionSize"
        className={`${styles['portion-size-inputbox']} ${isBlinking ? styles['blink'] : ''}`}
        type="number"
        placeholder="1"
        onFocus={(e) => e.target.value = ""}
        value={portionSize}
        onChange={(e) => setPortionSize(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleApplyPortion();
          }
        }}
      />
    </div>

    <h2 className={styles.h2}>Selected Rows</h2>
    <table className={styles['table-style']}>
      <thead className={styles['table-style']}>
        <tr>
          <th className="text-left">Remove</th>
          <th className="text-left">Desc 1</th>
          <th className="text-left">Desc 2</th>
          <th className="text-right">Portion</th>
          <th className="text-right">Calories</th>
          <th className="text-right">Carb</th>
          <th className="text-right">Fat</th>
          <th className="text-right">Protein</th>
          <th className="text-right">Fiber</th>
        </tr>
      </thead>
      <tbody>
        {selectedRows.map((item, index) => (
          <tr key={index}>
            <td>
              <input
                type="checkbox"
                onChange={() => handleCheckboxChange(index)}
              />
            </td>
            <td className="text-left">{item.desc1}</td>
            <td className="text-left">{item.desc2}</td>
            <td className="text-right">{item.portion}</td>
            <td className="text-right">{item.calories}</td>
            <td className="text-right">{item.carb}</td>
            <td className="text-right">{item.fat}</td>
            <td className="text-right">{item.protein}</td>
            <td className="text-right">{item.fiber}</td>
          </tr>
        ))}
        {/* Totals row (add blank col after caption) */}
        <tr>
          <td>Totals</td>
          <td></td>
          <td></td>
          <td className="text-right">{totals?.portionTot}</td>
          <td className="text-right">{totals?.caloriesTot}</td>
          <td className="text-right">{totals?.carbTot}</td>
          <td className="text-right">{totals?.fatTot}</td>
          <td className="text-right">{totals?.proteinTot}</td>
          <td className="text-right">{totals?.fiberTot}</td>
        </tr>
        {/* Nutrient Calories row (caption, grand total, 4 blank cols at end) */}
        <tr>
          <td colSpan={2} className="text-right">Nutrient Calories</td>
          <td></td>
          <td></td>
          <td className="text-right">Total non_protein cals:{nutrientCalories.grandTotal.toFixed(1)}</td>
          <td className="text-right">Carb calories: {nutrientCalories.carbCalories.toFixed(1)}</td>
          <td className="text-right">Fat calories: {nutrientCalories.fatCalories.toFixed(1)}</td>
          {/* <td className="text-right">Protein: {nutrientCalories.proteinCalories.toFixed(1)}</td> */}
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>

    {selectedRows.length > 0 && (
      <>
        {/* Only show name input for recipe */}
        {showNameInput && (
          <div className={styles['name-it-box']}>
            <label htmlFor="nameItBox">Give it a name:</label>
            <input
              id="nameItBox"
              className={styles['name-it-box-inputStyle']}
              type="text"
              value={namex}
              onChange={e => setName(e.target.value)}
              placeholder="fill me in"
            />
          </div>
        )}

        <div>
          <button
            id="saveAsMealButton"
            className="globalButton"
            onClick={handleSaveAsMeal}
          >
            Save as Meal
          </button>
        </div>

        <div>
          <button
            id="saveAsRecipeButton"
            className="globalButton"
            onClick={handleSaveAsRecipe}
          >
            Save as Recipe
          </button>
        </div>
      </>
    )}

    {message && <div className={styles['alert-popup2']}>{message}</div>}
  </div>
);

export default Meal_View;