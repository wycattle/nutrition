import React from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IOption, IMealDetail, NutrientCalories } from '../../types_interfaces/interfaces';
import styles from '../../styles/Meal_styles.module.scss';
import { Meal_View_Props } from '../../types_interfaces/interfaces';
import Spinner from '../../utils/Spinner';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';



//React.FC is FunctionComponent:  A React function component is
//a plain JavaScript function that accepts properties ("props") as an argument 
// and returns a React element (JSX)
const Meal_View: React.FC<Meal_View_Props> = ({
  dropdownOptions = [],
  dropdownSelectedValue,
  setDropdownSelectedValue,
  data = [],
  dropdownCheckedRows,
  setDropdownCheckedRows,
  handleRowSelect,
  portionSize,
  setPortionSize,
  isBlinking,
  handleApplyPortion,
  selectedRows = [],
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
  categoryOptions = [],
  selectedCategory,
  setSelectedCategory,
  showDatePicker,
  showConfirmSaveButton,
  isSavingMeal,
  recipeDate,
  setRecipeDate,
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchResults = [],
  isSearching,
}) => {
  const safeNutrientCalories = nutrientCalories ?? { carbCalories: 0, fatCalories: 0, proteinCalories: 0, grandTotal: 0 };

  // Ref for the portion size input (for focusing)
  const focusPortionInputRef = React.useRef<HTMLInputElement>(null);

  // Voice input for the nutrition search box
  const { transcript, listening: isListening, browserSupportsSpeechRecognition: isSpeechSupported, resetTranscript } = useSpeechRecognition();

  // When transcript updates, feed it into the search box
  React.useEffect(() => {
    if (transcript) setSearchTerm(transcript);
  }, [transcript]);




  return (
  <div className={styles['page-root']}>
    <div>
      <Link href="/">
        <span className={styles['back-to-home-page']}>Back to Home Page</span>
      </Link>
    </div>

    {/* Controls Row: food group dropdown and search box */}
    <div style={{ display: 'flex', alignItems: 'center', width: '100vw', maxWidth: '100vw', margin: '0 auto', boxSizing: 'border-box', padding: '0 2vw' }}>
      <div className={styles['select-food-group-container']} style={{ flex: '0 0 420px', minWidth: 320 }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginLeft: '2vw', flex: 1 }}>
        <label htmlFor="nutrition-search-box" style={{ marginRight: 4 }}>
          search the nutrition table
        </label>
        <input
          id="nutrition-search-box"
          type="text"
          placeholder="type & press Enter..."
          value={searchTerm || ''}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          style={{ minWidth: 180 }}
        />
        {isSpeechSupported && (
          <button
            type="button"
            title={isListening ? 'Stop listening' : 'Search by voice (Chrome/Edge only)'}
            onClick={() => {
              if (isListening) {
                SpeechRecognition.stopListening();
                setTimeout(handleSearch, 300);
              } else {
                resetTranscript();
                SpeechRecognition.startListening({ language: 'en-US' });
              }
            }}
            style={{
              background: isListening ? '#c0392b' : '#32232c',
              color: isListening ? '#fff' : '#c6a3dd',
              border: `2px solid ${isListening ? '#e74c3c' : '#725e5e'}`,
              borderRadius: '8px',
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '1.2em',
              lineHeight: 1,
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            {isListening ? '⏹' : '🎤'}
          </button>
        )}
        {isSearching && <Spinner />}
        {!isSearching && searchTerm?.trim() && searchResults.length === 0 && (
          <span style={{ color: '#ed5b5b', fontSize: '0.85em' }}>
            Item not found
          </span>
        )}
        {!isSearching && searchResults.length > 0 && (
          <span style={{ color: '#07efc8', fontSize: '0.85em' }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>




    {/* Search results table: always full width, below controls row */}
    {searchResults.length > 0 && (
      <div
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw',
          maxWidth: '100vw',
          minWidth: 600,
          margin: '2em -50vw',
          border: '2px solid #07efc8',
          borderRadius: 12,
          background: '#23272b',
          boxShadow: '0 2px 8px rgba(44,68,66,0.12)',
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            fontSize: '0.95em',
            borderCollapse: 'collapse',
            width: '100%',
            tableLayout: 'fixed',
            minWidth: '100%',
          }}
        >
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '85%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '2px solid #ed5b5b', color: '#52e87a' }}>
              <th style={{ padding: '0.3em 0.6em', textAlign: 'left' }}>Desc 1</th>
              <th
                style={{
                  padding: '0.3em 0.6em',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Desc 2
              </th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #725e5e' }}>
                <td style={{ padding: '0.3em 0.6em', textAlign: 'left' }}>{item.desc1}</td>
                <td
                  style={{
                    padding: '0.3em 0.6em',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.desc2}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {dropdownSelectedValue && (
      <div
        style={{
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          width: '100vw',
          maxWidth: '100vw',
          minWidth: 600,
          margin: '2em -50vw',
          overflowX: 'auto',
        }}
      >
        <table 
          className={styles['table-style']} 
          style={{ 
            fontSize: '0.95em', 
            borderCollapse: 'collapse', 
            width: '60%', 
            tableLayout: 'fixed',
            minWidth: '60%',
          }}
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>
        <thead className={styles['table-style']}>
          <tr>
            <th style={{ textAlign: 'left' }}>Select</th>
            <th style={{ textAlign: 'left' }}>Desc 1</th>
            <th style={{ textAlign: 'left' }}>Desc 2</th>
            <th style={{ textAlign: 'right' }}>Portion</th>
            <th style={{ textAlign: 'right' }}>Calories</th>
            <th style={{ textAlign: 'right' }}>Carb</th>
            <th style={{ textAlign: 'right' }}>Fat</th>
            <th style={{ textAlign: 'right' }}>Protein</th>
            <th style={{ textAlign: 'right' }}>Fiber</th>
          </tr>
        </thead>
        <tbody>
          {data.filter(item => item.desc1 === dropdownSelectedValue?.value)
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
                      setTimeout(() => {
                        if (focusPortionInputRef.current) {
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
              <td style={{ textAlign: 'right' }}>{item.portion}</td>
              <td style={{ textAlign: 'right' }}>{item.calories}</td>
              <td style={{ textAlign: 'right' }}>{item.carb}</td>
              <td style={{ textAlign: 'right' }}>{item.fat}</td>
              <td style={{ textAlign: 'right' }}>{item.protein}</td>
              <td style={{ textAlign: 'right' }}>{item.fiber}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    )}

    <div className={styles['portion-container']} style={{ margin: '20px 0 20px 5vw' }}>
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
        placeholder=""
        onFocus={(e) => {
          e.target.select();
        }}
        value={portionSize === 0 ? '' : portionSize}
        onChange={(e) => setPortionSize(Number(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleApplyPortion();
          }
        }}
      />
    </div>

    <h2 className={styles.h2}>Selected Rows (check box to delete)</h2>
    <div
      style={{
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        width: '100vw',
        maxWidth: '100vw',
        minWidth: 600,
        margin: '2em -50vw',
        overflowX: 'auto',
      }}
    >
      <table className={styles['table-style']} style={{ fontSize: '0.95em', borderCollapse: 'collapse', width: '60%', tableLayout: 'fixed', minWidth: '60%' }}>
        <colgroup>
          <col style={{ width: '5%' }} /> {/* Remove */}
          <col style={{ width: '10%' }} /> {/* Desc1 */}
          <col style={{ width: '15%' }} /> {/* Desc2 */}
          <col style={{ width: '5%' }} /> {/* Portion */}
          <col style={{ width: '8%' }} /> {/* Calories */}
          <col style={{ width: '8%' }} /> {/* Carb */}
          <col style={{ width: '8%' }} /> {/* Fat */}
          <col style={{ width: '8%' }} /> {/* Protein */}
          <col style={{ width: '8%' }} /> {/* Fiber */}
        </colgroup>
        <thead className={styles['table-style']}>
          <tr>
            <th style={{ textAlign: 'left' }}>Remove</th>
            <th style={{ textAlign: 'left' }}>Desc 1</th>
            <th style={{ textAlign: 'left' }}>Desc 2</th>
            <th style={{ textAlign: 'right' }}>Portion</th>
            <th style={{ textAlign: 'right' }}>Calories</th>
            <th style={{ textAlign: 'right' }}>Carb</th>
            <th style={{ textAlign: 'right' }}>Fat</th>
            <th style={{ textAlign: 'right' }}>Protein</th>
            <th style={{ textAlign: 'right' }}>Fiber</th>
          </tr>
        </thead>
        <tbody className={styles['table-style']}>
          {selectedRows.map((item, index) => (
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
    {selectedRows.length > 0 && (
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