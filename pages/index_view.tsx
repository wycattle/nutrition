import React from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import styles from '../styles/createMeal_styles.module.scss';
import { IOption, IMealDetail, IndexViewProps } from './interfaces';


const IndexView: React.FC<IndexViewProps> = ({
  dropdownOptions,
  dropdownSelectedValue,
  setDropdownSelectedValue,
  data,
  portionSize,
  setPortionSize,
  selectedRows,
  totals,
  handleRowSelect,
  handleRemoveRow,
  showNameInput,
  namex,
  setName,
  handleSaveAsMeal,
  handleSaveAsRecipe,
  message,
}) => (
  <div className={styles['page-root']}>
    <Link href="/">
      <span className={styles['back-to-home-page']}>Back to Home Page</span>
    </Link>

    <div className={styles['select-food-group-container']}>
      <label htmlFor="select-food-group-item" className={styles['select-food-group-item-labelStyle']}>
        Select a food group
      </label>
      <Select
        options={dropdownOptions}
        onChange={values => setDropdownSelectedValue(values[0])}
        values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
      />
    </div>

    {dropdownSelectedValue && (
      <table className={styles['table-style']}>
        <thead>
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
          {data.filter(item => item.desc1 === dropdownSelectedValue.value).map((item, idx) => (
            <tr key={idx}>
              <td>
                <button onClick={() => handleRowSelect(item)}>Add</button>
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
      <label htmlFor="portionSize">Enter portion size:</label>
      <input
        id="portionSize"
        className={styles['portion-size-inputbox']}
        type="number"
        min={1}
        value={portionSize}
        onChange={e => setPortionSize(Number(e.target.value))}
      />
    </div>

    <h2 className={styles.h2}>Selected Rows</h2>
    <table className={styles['table-style']}>
      <thead>
        <tr>
          <th>Remove</th>
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
        {selectedRows.map((item, idx) => (
          <tr key={idx}>
            <td>
              <button onClick={() => handleRemoveRow(idx)}>Remove</button>
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
        <tr>
          <td>Totals</td>
          <td></td>
          <td></td>
          <td>{totals.portionTot}</td>
          <td>{totals.caloriesTot}</td>
          <td>{totals.carbTot}</td>
          <td>{totals.fatTot}</td>
          <td>{totals.proteinTot}</td>
          <td>{totals.fiberTot}</td>
        </tr>
      </tbody>
    </table>

    {selectedRows.length > 0 && (
      <>
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
            className={styles['saveAsMealButtonStyle']}
            onClick={handleSaveAsMeal}
          >
            Save as Meal
          </button>
        </div>
        <div>
          <button
            id="saveAsRecipeButton"
            className={styles['saveAsRecipeButtonStyle']}
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

export default IndexView;