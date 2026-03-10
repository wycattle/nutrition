import React from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IOption, IMealDetail, NutrientCalories } from '../../types_interfaces/interfaces';
import styles from '../../styles/Meal_styles.module.scss';
import { Meal_View_Props } from '../../types_interfaces/interfaces';

// Simple spinner component
const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1em 0' }}>
    <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #32232c', borderRadius: '50%', width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);


//React.FC is FunctionComponent:  A React function component is
//a plain JavaScript function that accepts properties ("props") as an argument 
// and returns a React element (JSX)
const Meal_View: React.FC<Meal_View_Props> = ({
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
  handleConfirmSaveMeal,
  handleSaveAsRecipe,
  message,
  categoryOptions,
  selectedCategory,
  setSelectedCategory,
  showDatePicker,
  showConfirmSaveButton,
  isSavingMeal,
  recipeDate,       // = meal_recipeDate from index.tsx
  setRecipeDate,    // = setMeal_recipeDate from index.tsx
  }) => {
  const safeNutrientCalories = nutrientCalories ?? { carbCalories: 0, fatCalories: 0, proteinCalories: 0, grandTotal: 0 };

  // Ref for the portion size input (for focusing)
  const focusPortionInputRef = React.useRef<HTMLInputElement>(null);




  return (


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
          placeholder='Click here . . .'
          values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
          dropdownHeight="auto"
        />
      </div>
    </div>

    {dropdownSelectedValue && (
      <table className={styles['table-style']}>
        <thead className={styles['table-style']}>
          <tr>
            <th style={{ textAlign: 'left' }}>Select</th>
            <th style={{ textAlign: 'left' }}>Desc 1</th>
            <th style={{ textAlign: 'left' }}>Desc 2</th>
            <th style={{ textAlign: 'left' }}>Portion</th>
            <th style={{ textAlign: 'left' }}>Calories</th>
            <th style={{ textAlign: 'left' }}>Carb</th>
            <th style={{ textAlign: 'left' }}>Fat</th>
            <th style={{ textAlign: 'left' }}>Protein</th>
            <th style={{ textAlign: 'left' }}>Fiber</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).filter(item => item.desc1 === dropdownSelectedValue?.value)
            .sort((a, b) => (a.desc2 ?? '').localeCompare(b.desc2 ?? ''))
            .map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'left' }}>
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
                      // Clear the portion input, focus, and select for fresh entry
                      if (typeof setPortionSize === 'function') setPortionSize(0);
                      setTimeout(() => {
                        if (focusPortionInputRef.current) {
                          focusPortionInputRef.current.value = '';
                          focusPortionInputRef.current.focus();
                        }
                      }, 0);
                    }
                    setDropdownCheckedRows(new Set(dropdownCheckedRows));
                  }}
                />
              </td>
              <td style={{ textAlign: 'left' }}>{item.desc1}</td>
              <td style={{ textAlign: 'left' }}>{item.desc2}</td>
              <td style={{ textAlign: 'left' }}>{item.portion}</td>
              <td style={{ textAlign: 'left' }}>{item.calories}</td>
              <td style={{ textAlign: 'left' }}>{item.carb}</td>
              <td style={{ textAlign: 'left' }}>{item.fat}</td>
              <td style={{ textAlign: 'left' }}>{item.protein}</td>
              <td style={{ textAlign: 'left' }}>{item.fiber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    <div className={styles['portion-container']}>
      <label
        htmlFor="portionSize"
        className={isBlinking ? styles['blink'] : ''}
      >
        enter a portion size number and click Enter (1=100g)
      </label>
      <input
        id="portionSize"
        ref={focusPortionInputRef}
        className={`${styles['portion-size-inputbox']} ${isBlinking ? styles['blink'] : ''}`}
        type="number"
        placeholder="0"
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

    <h2 className={styles.h2}>Selected Rows (check box to delete)</h2>
    <div style={{ width: '55vw', minWidth: 600, maxWidth: 900, marginLeft: 24, marginRight: 'auto' }}>
      <table className={styles['table-style']} style={{ fontSize: '1em', borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '7vw', minWidth: 60, maxWidth: 100 }} /> {/* Remove */}
          <col style={{ width: '10vw', minWidth: 80, maxWidth: 120 }} /> {/* Desc1 */}
          <col style={{ width: '16vw', minWidth: 120, maxWidth: 180 }} /> {/* Desc2 */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Portion */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Calories */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Carb */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Fat */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Protein */}
          <col style={{ width: '6vw', minWidth: 50, maxWidth: 70 }} /> {/* Fiber */}
        </colgroup>
        <thead className={styles['table-style']}>
          <tr>
            <th style={{ textAlign: 'center', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Remove</th>
            <th style={{ textAlign: 'left', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Desc 1</th>
            <th style={{ textAlign: 'left', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Desc 2</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Portion</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Calories</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Carb</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Fat</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Protein</th>
            <th style={{ textAlign: 'right', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Fiber</th>
          </tr>
        </thead>
        <tbody className={styles['table-style']}>
          {(selectedRows ?? []).map((item, index) => (
            <tr key={index} style={{ height: '32px', background: index % 2 === 0 ? '#23272b' : '#1f2226' }}>
              <td style={{ textAlign: 'center', border: '1px solid #000', background: 'inherit' }}>
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(index)}
                />
              </td>
              <td style={{ textAlign: 'left', border: '1px solid #000', background: 'inherit' }}>{item.desc1}</td>
              <td style={{ textAlign: 'left', border: '1px solid #000', background: 'inherit' }}>{item.desc2}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.portion}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.calories}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.carb}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.fat}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.protein}</td>
              <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{item.fiber}</td>
            </tr>
          ))}
          {/* Totals row (add blank col after caption) */}
          <tr>
            <td style={{ border: '1px solid #000', background: 'inherit' }}>Totals</td>
            <td style={{ border: '1px solid #000', background: 'inherit' }}></td>
            <td style={{ border: '1px solid #000', background: 'inherit' }}></td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.portionTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.caloriesTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.carbTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.fatTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.proteinTot}</td>
            <td style={{ textAlign: 'right', border: '1px solid #000', background: 'inherit' }}>{totals?.fiberTot}</td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Nutrient Calories separate container */}
    <h2 className={styles.h2}>Non-protein nutrient calories</h2>
    <div className={styles['nutrient-calories-container']} style={{ marginTop: '1.5em', marginBottom: '1.5em' }}>
      <div style={{ display: 'flex', gap: '2em', alignItems: 'center' }}>
        <span style={{ fontWeight: 'bold' }}>Nutrient Calories</span>
        <span>total non_protein cals: {safeNutrientCalories.grandTotal.toFixed(1)}</span>
        <span>Carb: {safeNutrientCalories.carbCalories.toFixed(1)}</span>
        <span>Fat: {safeNutrientCalories.fatCalories.toFixed(1)}</span>
        {/* <span>Protein: {safeNutrientCalories.proteinCalories.toFixed(1)}</span> */}
      </div>
    </div>
    {(selectedRows ?? []).length > 0 && (
      <>
        {/* Only show name and category input for recipe */}
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
            <div style={{ marginTop: '0.5em' }}>
              <label>Category:</label>
              <Select
                options={categoryOptions}
                onChange={vals => setSelectedCategory(vals[0]?.value || '')}
                placeholder="Select category"
                values={selectedCategory ? [{ label: selectedCategory, value: selectedCategory }] : []}
                style={{ width: '200px', marginTop: '0.25em' }}
              />
            </div>
          </div>
        )}


        {/* Step 1: Save as Meal button, then show date picker */}
        <div style={{ marginTop: '1em' }}>
          <button
            id="saveAsMealButton"
            className="globalButton"
            onClick={handleSaveAsMeal}
            disabled={isSavingMeal}
          >
            Save as Meal?
          </button>
        </div>
        {showDatePicker && (
          <div style={{ marginTop: '0.75em' }}>
            <label>Pick a date for the meal:&nbsp;</label>
            <DatePicker
              selected={recipeDate}
              onChange={(date: Date | null) => setRecipeDate(date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Pick a date"
              isClearable
              disabled={isSavingMeal}
            />
          </div>
        )}
        {/* Step 2: Confirm Save button appears after date is picked */}
        {showConfirmSaveButton && !isSavingMeal && (
          <div style={{ marginTop: '1em' }}>
            <button
              id="confirmSaveMealButton"
              className="globalButton"
              onClick={handleConfirmSaveMeal}
            >
              Confirm Save Meal
            </button>
          </div>
        )}
        {/* Spinner while saving */}
        {isSavingMeal && <Spinner />}

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
}

export default Meal_View;