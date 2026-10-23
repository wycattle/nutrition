/**
 * pages/dayplanner/index.tsx
 * One Day Diet Planner – named, editable full-day food plan saved in day_planner table.
 * Combines:
 *   - food picker UX from pages/meal/index.tsx
 *   - inline-editable table from pages/recipe/index.tsx
 *   - grouped food-group breakdown from pages/combinedTotalsByDateRange/index.tsx
 */
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Select from 'react-dropdown-select';
import * as R from 'ramda';
import useSWR from 'swr';
import axios from 'axios';
import { RDA } from '../../utils/rda';

import {
  IOption,
  IMealDetail,
  IDayPlanDetail,
  IDayPlan,
} from '../../types_interfaces/interfaces';
import { fetcher, defaultSwrOptions } from '../../utils/swrHelper';
import { calculateTotals, calculatePer100g } from '../../utils/methods';
import Spinner from '../../utils/Spinner';

const TIME_OF_DAY_OPTIONS = ['', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Other'];

const btnStyle: React.CSSProperties = {
  background: '#32232c',
  color: '#c6a3dd',
  border: '2px solid #725e5e',
  borderRadius: '10px',
  padding: '6px 18px',
  fontSize: '15px',
  cursor: 'pointer',
  marginRight: '0.5em',
};

export default function DayPlanner() {
  // ── Plan list (SWR) ─────────────────────────────────────────────────────
  const {
    data: planList = [],
    isLoading: plansLoading,
    mutate: mutatePlans,
  } = useSWR<{ name: string; notes?: string }[]>('/api/day_planner/day_planner', fetcher, defaultSwrOptions);

  const planOptions: IOption[] = planList.map(p => ({ label: p.name, value: p.name }));

  // ── Plan meta state ────────────────────────────────────────────────────
  const [selectedPlanOption, setSelectedPlanOption] = useState<IOption | null>(null);
  const [planName, setPlanName] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ── Plan rows ──────────────────────────────────────────────────────────
  // editRows: the displayed / edited rows
  // baseRows: per-portion-1 values used to recalculate nutrients when portion changes
  const [editRows, setEditRows] = useState<IDayPlanDetail[]>([]);
  const [baseRows, setBaseRows] = useState<IDayPlanDetail[]>([]);
  // checkedRows: which rows are included in totals (all by default)
  const [checkedRows, setCheckedRows] = useState<Set<number>>(new Set());

  // ── Totals (from checked rows only) ───────────────────────────────────
  const totals = useMemo(() => {
    const active = editRows.filter((_, i) => checkedRows.has(i));
    return calculateTotals(active);
  }, [editRows, checkedRows]);

  const per100g = useMemo(() => calculatePer100g(totals), [totals]);

  // ── Breakdown by food group (desc1) ───────────────────────────────────
  const groupedByDesc1 = useMemo(() => {
    const active = editRows.filter((_, i) => checkedRows.has(i));
    const map: Record<string, IDayPlanDetail[]> = {};
    active.forEach(row => {
      const key = row.desc1 || '(unknown)';
      if (!map[key]) map[key] = [];
      map[key].push(row);
    });
    return Object.entries(map).map(([desc1, rows]) => ({
      desc1,
      rows,
      sub: calculateTotals(rows),
    }));
  }, [editRows, checkedRows]);

  const [nutritionDetails, setNutritionDetails] = useState<{ per100g: Record<string, number>; lipidCols: string[]; vitaminCols: string[] } | null>(null);
  const [nutritionDetailsLoading, setNutritionDetailsLoading] = useState(false);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (key: string) =>
    setExpandedGroups(prev => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });

  // Auto-fetch nutrition details when editRows change
  useEffect(() => {
    const active = editRows.filter((_, i) => checkedRows.has(i));
    if (active.length === 0) { setNutritionDetails(null); return; }
    setNutritionDetailsLoading(true);
    axios.post('/api/recipe_related/nutrition_details', {
      details: active.map(r => ({ desc1: r.desc1, desc2: r.desc2, portion: r.portion })),
    })
      .then(res => setNutritionDetails(res.data))
      .catch(() => setNutritionDetails(null))
      .finally(() => setNutritionDetailsLoading(false));
  }, [editRows, checkedRows]);

  // ── Food picker state ──────────────────────────────────────────────────
  const focusPortionRef = React.useRef<HTMLInputElement>(null);
  const { data: nutritionData = [] } = useSWR('/api/nutrition', fetcher, defaultSwrOptions);
  const [dropdownOptions, setDropdownOptions] = useState<IOption[]>([]);
  const [dropdownSelectedValue, setDropdownSelectedValue] = useState<IOption | null>(null);
  const [dropdownCheckedRows, setDropdownCheckedRows] = useState<Set<number>>(new Set());
  const [selectedPickerRow, setSelectedPickerRow] = useState<IMealDetail | null>(null);
  const [portionSize, setPortionSize] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState(false);

  // ── Search state ───────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IMealDetail[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCheckedIdx, setSearchCheckedIdx] = useState<number | null>(null);

  // Build food-group dropdown options when nutritionData loads
  useEffect(() => {
    const uniqueValues = R.uniq(R.map((item: IMealDetail) => item.desc1, nutritionData));
    const opts: IOption[] = R.map((v: string) => ({ label: v, value: v }), uniqueValues);
    setDropdownOptions(prev => {
      const prevStr = prev.map(o => o.label).join(',');
      const newStr = opts.map(o => o.label).join(',');
      return prevStr === newStr ? prev : opts;
    });
  }, [nutritionData]);

  // Trigger blink on portion label when a food item is checked
  useEffect(() => {
    if (dropdownCheckedRows.size > 0 || searchCheckedIdx !== null) setIsBlinking(true);
    else setIsBlinking(false);
  }, [dropdownCheckedRows, searchCheckedIdx]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(
        `/api/nutrition_search?search_word=${encodeURIComponent(searchTerm)}`
      );
      setSearchResults(res.data);
      setSearchCheckedIdx(null);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Apply portion and add selected food item to plan
  const handleApplyPortion = () => {
    if (!selectedPickerRow || portionSize <= 0) return;
    const row = selectedPickerRow;
    const scaled: IDayPlanDetail = {
      ...row,
      portion: portionSize,
      calories: (row.calories || 0) * portionSize,
      carb:     (row.carb     || 0) * portionSize,
      fat:      (row.fat      || 0) * portionSize,
      protein:  (row.protein  || 0) * portionSize,
      fiber:    (row.fiber    || 0) * portionSize,
      time_of_day: '',
    };
    // base stores per-portion-1 values (the raw nutritionData row is already per-1-portion)
    const base: IDayPlanDetail = { ...row, time_of_day: '' };
    const newIdx = editRows.length;
    setEditRows(prev => [...prev, scaled]);
    setBaseRows(prev => [...prev, base]);
    setCheckedRows(prev => { const s = new Set(prev); s.add(newIdx); return s; });
    // Reset picker
    setDropdownCheckedRows(new Set());
    setSearchCheckedIdx(null);
    setSelectedPickerRow(null);
    setIsBlinking(false);
    setPortionSize(0);
    setTimeout(() => focusPortionRef.current?.focus(), 0);
  };

  // ── Plan table handlers ────────────────────────────────────────────────

  const handleCheckbox = (idx: number) =>
    setCheckedRows(prev => {
      const s = new Set(prev);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      return s;
    });

  const handleDeleteRow = (idx: number) => {
    setEditRows(prev => prev.filter((_, i) => i !== idx));
    setBaseRows(prev => prev.filter((_, i) => i !== idx));
    setCheckedRows(prev => {
      const s = new Set<number>();
      prev.forEach(i => {
        if (i < idx) s.add(i);
        else if (i > idx) s.add(i - 1);
      });
      return s;
    });
  };

  const handlePortionChange = (idx: number, value: string) => {
    const portion = parseFloat(value);
    const base = baseRows[idx];
    if (!base) return;
    const p = isNaN(portion) ? 0 : portion;
    setEditRows(prev =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              portion: p,
              calories: (base.calories || 0) * p,
              carb:     (base.carb     || 0) * p,
              fat:      (base.fat      || 0) * p,
              protein:  (base.protein  || 0) * p,
              fiber:    (base.fiber    || 0) * p,
            }
          : row
      )
    );
  };

  const handleCellChange = (idx: number, field: keyof IDayPlanDetail, value: string) => {
    if (['note', 'desc1', 'desc2', 'time_of_day'].includes(field as string)) {
      setEditRows(prev => prev.map((row, i) => i === idx ? { ...row, [field]: value } : row));
    } else {
      const numVal = parseFloat(value);
      setEditRows(prev =>
        prev.map((row, i) =>
          i === idx ? { ...row, [field]: isNaN(numVal) ? undefined : numVal } : row
        )
      );
    }
  };

  const handleAddBlankRow = () => {
    const blank: IDayPlanDetail = {
      desc1: '', desc2: '', portion: 0,
      calories: 0, carb: 0, fat: 0, protein: 0, fiber: 0,
      GI: 0, note: '', time_of_day: '',
    };
    const newIdx = editRows.length;
    setEditRows(prev => [...prev, blank]);
    setBaseRows(prev => [...prev, blank]);
    setCheckedRows(prev => { const s = new Set(prev); s.add(newIdx); return s; });
  };

  // ── Load plan from DB ──────────────────────────────────────────────────
  const handleLoadPlan = async (name: string) => {
    setIsLoadingPlan(true);
    try {
      const res = await axios.get(
        `/api/day_planner/day_planner?name=${encodeURIComponent(name)}`
      );
      const plan: IDayPlan = res.data;
      const details: IDayPlanDetail[] = (plan.details || []).map(row => ({
        ...row,
        time_of_day: row.time_of_day || '',
      }));
      setEditRows(details);
      // Derive per-portion-1 base values from stored totals
      setBaseRows(
        details.map(row => ({
          ...row,
          calories: (row.calories || 0) / (row.portion || 1),
          carb:     (row.carb     || 0) / (row.portion || 1),
          fat:      (row.fat      || 0) / (row.portion || 1),
          protein:  (row.protein  || 0) / (row.portion || 1),
          fiber:    (row.fiber    || 0) / (row.portion || 1),
        }))
      );
      setCheckedRows(new Set(details.map((_, i) => i)));
      setPlanName(plan.name);
      setPlanNotes(plan.notes || '');
    } catch {
      setMessage('Could not load plan.');
      setTimeout(() => setMessage(''), 2500);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const handleClearPlan = () => {
    setEditRows([]);
    setBaseRows([]);
    setCheckedRows(new Set());
    setPlanNotes('');
    setSelectedPlanOption(null);
    setPlanName('');
  };

  // ── Save plan ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!planName.trim()) {
      setMessage('Enter a plan name first.');
      setTimeout(() => setMessage(''), 2500);
      return;
    }
    setIsSaving(true);
    try {
      const plan: IDayPlan = {
        name: planName.trim(),
        details: editRows,
        notes: planNotes || undefined,
      };
      await axios.post('/api/day_planner/day_planner', plan);
      setMessage('Plan saved!');
      mutatePlans();
      setTimeout(() => setMessage(''), 2500);
    } catch {
      setMessage('Error saving plan.');
      setTimeout(() => setMessage(''), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!planName.trim()) return;
    if (!window.confirm(`Delete plan "${planName}"?`)) return;
    try {
      await axios.delete(
        `/api/day_planner/day_planner?name=${encodeURIComponent(planName)}`
      );
      setMessage('Plan deleted.');
      handleClearPlan();
      mutatePlans();
      setTimeout(() => setMessage(''), 2500);
    } catch {
      setMessage('Error deleting plan.');
      setTimeout(() => setMessage(''), 2500);
    }
  };

  return (
    <div style={{ padding: '0 2vw 4em 2vw' }}>

      {/* ── Header ── */}
      <div style={{ display: 'inline-block' }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>
      <h2 style={{ color: '#c6a3dd', margin: '0.3em 0 0.75em 0' }}>One Day Diet Planner</h2>

      {/* ── Plan selector / name / notes ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap', marginBottom: '1.25em', borderBottom: '1px solid #725e5e', paddingBottom: '1em' }}>
        <div style={{ minWidth: 240 }}>
          <Select
            options={planOptions}
            onChange={vals => {
              const opt = vals[0] || null;
              setSelectedPlanOption(opt);
              if (opt) handleLoadPlan(opt.value);
            }}
            placeholder={plansLoading ? 'Loading...' : 'Load existing plan...'}
            values={selectedPlanOption ? [selectedPlanOption] : []}
            disabled={plansLoading}
          />
        </div>
        {isLoadingPlan && <Spinner size={20} />}

        <span style={{ color: '#725e5e' }}>or type a name:</span>
        <input
          type="text"
          value={planName}
          onChange={e => setPlanName(e.target.value)}
          placeholder="e.g. My Monday Plan"
          style={{ minWidth: 200 }}
          className="my-input-class"
        />
        <button style={btnStyle} onClick={handleClearPlan}>New / Clear</button>

        <label style={{ color: '#c6a3dd', marginLeft: '0.5em' }}>Notes:</label>
        <input
          type="text"
          value={planNotes}
          onChange={e => setPlanNotes(e.target.value)}
          placeholder="optional"
          style={{ minWidth: 160 }}
          className="my-input-class"
        />
      </div>

      {/* ── Food Picker ── */}
      <div style={{ marginBottom: '1.25em' }}>
        <h3 style={{ color: '#52e87a', margin: '0 0 0.5em 0' }}>Add Food to Plan</h3>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2em', flexWrap: 'wrap' }}>
          {/* Food group dropdown */}
          <div style={{ minWidth: 320 }}>
            <label style={{ color: '#c6a3dd', display: 'block', marginBottom: 3, fontSize: '0.9em' }}>
              Select food group
            </label>
            <Select
              options={dropdownOptions}
              onChange={vals => {
                setDropdownSelectedValue(vals[0] || null);
                setDropdownCheckedRows(new Set());
              }}
              placeholder="Click here..."
              values={dropdownSelectedValue ? [dropdownSelectedValue] : []}
              dropdownHeight="auto"
            />
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', flexWrap: 'wrap' }}>
            <label style={{ color: '#c6a3dd', fontSize: '0.9em' }}>Search nutrition table:</label>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="type & press Enter..."
              style={{ minWidth: 180 }}
              className="my-input-class"
            />
            {isSearching && <Spinner size={18} />}
            {!isSearching && searchTerm.trim() && searchResults.length === 0 && (
              <span style={{ color: '#ed5b5b', fontSize: '0.85em' }}>Not found</span>
            )}
            {searchResults.length > 0 && (
              <span style={{ color: '#07efc8', fontSize: '0.85em' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Food-group item table */}
        {dropdownSelectedValue && (
          <div style={{ overflowX: 'auto', marginTop: '0.75em' }}>
            <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', minWidth: 580 }}>
              <thead>
                <tr style={{ color: '#52e87a', borderBottom: '2px solid #ed5b5b' }}>
                  <th style={{ padding: '0.25em 0.5em' }}>Select</th>
                  <th style={{ textAlign: 'left',  padding: '0.25em 0.5em' }}>Desc 1</th>
                  <th style={{ textAlign: 'left',  padding: '0.25em 0.5em' }}>Desc 2</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Portion</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Cal</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Carb</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Fat</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Protein</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Fiber</th>
                </tr>
              </thead>
              <tbody>
                {(nutritionData as IMealDetail[])
                  .filter(item => item.desc1 === dropdownSelectedValue.value)
                  .sort((a, b) => (a.desc2 ?? '').localeCompare(b.desc2 ?? ''))
                  .map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #3b4144' }}>
                      <td style={{ textAlign: 'center', padding: '0.2em 0.5em' }}>
                        <input
                          type="checkbox"
                          style={{ transform: 'scale(1.7)' }}
                          checked={dropdownCheckedRows.has(index)}
                          onChange={() => {
                            setSelectedPickerRow(item);
                            setSearchCheckedIdx(null);
                            const next = new Set<number>();
                            if (!dropdownCheckedRows.has(index)) next.add(index);
                            setDropdownCheckedRows(next);
                            setTimeout(() => focusPortionRef.current?.focus(), 0);
                          }}
                        />
                      </td>
                      <td style={{ padding: '0.2em 0.5em' }}>{item.desc1}</td>
                      <td style={{ padding: '0.2em 0.5em' }}>{item.desc2}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.portion}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.calories}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.carb}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.fat}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.protein}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.fiber}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Search results table */}
        {searchResults.length > 0 && (
          <div style={{ overflowX: 'auto', marginTop: '0.75em', border: '2px solid #07efc8', borderRadius: 8, background: '#23272b' }}>
            <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ color: '#52e87a', borderBottom: '2px solid #ed5b5b' }}>
                  <th style={{ padding: '0.25em 0.5em' }}>Select</th>
                  <th style={{ textAlign: 'left',  padding: '0.25em 0.5em' }}>Desc 1</th>
                  <th style={{ textAlign: 'left',  padding: '0.25em 0.5em' }}>Desc 2</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Cal</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Carb</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Fat</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Protein</th>
                  <th style={{ textAlign: 'right', padding: '0.25em 0.5em' }}>Fiber</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #725e5e',
                      background: searchCheckedIdx === idx ? '#2a3a2a' : 'transparent',
                    }}
                  >
                    <td style={{ textAlign: 'center', padding: '0.2em 0.5em' }}>
                      <input
                        type="checkbox"
                        style={{ transform: 'scale(1.7)' }}
                        checked={searchCheckedIdx === idx}
                        onChange={() => {
                          const picking = searchCheckedIdx !== idx;
                          setSelectedPickerRow(picking ? item : null);
                          setDropdownCheckedRows(new Set());
                          setSearchCheckedIdx(picking ? idx : null);
                          if (picking) setTimeout(() => focusPortionRef.current?.focus(), 0);
                        }}
                      />
                    </td>
                    <td style={{ padding: '0.2em 0.5em' }}>{item.desc1}</td>
                    <td style={{ padding: '0.2em 0.5em' }}>{item.desc2}</td>
                    <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.calories}</td>
                    <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.carb}</td>
                    <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.fat}</td>
                    <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.protein}</td>
                    <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>{item.fiber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Portion entry */}
        <div style={{ marginTop: '0.75em', display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
          <label style={{ color: isBlinking ? '#ed5b5b' : '#c6a3dd', fontWeight: isBlinking ? 'bold' : 'normal' }}>
            Portion size (1 = 100g) — press Enter to add:
          </label>
          <input
            ref={focusPortionRef}
            type="number"
            min="0"
            step="0.1"
            value={portionSize === 0 ? '' : portionSize}
            onFocus={e => e.target.select()}
            onChange={e => setPortionSize(Number(e.target.value))}
            onKeyDown={e => { if (e.key === 'Enter') handleApplyPortion(); }}
            style={{ width: 80, textAlign: 'center' }}
            className="my-input-class"
          />
          <button style={btnStyle} onClick={handleApplyPortion}>+ Add to Plan</button>
          {selectedPickerRow && (
            <span style={{ color: '#07efc8', fontSize: '0.85em' }}>
              Selected: <strong>{selectedPickerRow.desc1}</strong> / {selectedPickerRow.desc2}
            </span>
          )}
        </div>
      </div>

      {/* ── Plan Table ── */}
      <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', marginBottom: '1em' }}>
        <h3 style={{ color: '#52e87a', margin: '0 0 0.5em 0' }}>
          Plan:{' '}
          {planName
            ? <span style={{ color: '#c6a3dd' }}>{planName}</span>
            : <em style={{ color: '#725e5e' }}>unnamed — enter a name above</em>}
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', minWidth: 920 }}>
            <thead>
              <tr style={{ color: '#f7c1c1', background: '#3b4144', borderBottom: '2px solid #725e5e' }}>
                <th style={{ padding: '0.3em 0.4em' }}>Del</th>
                <th style={{ padding: '0.3em 0.4em' }}>☑</th>
                <th style={{ textAlign: 'left',  padding: '0.3em 0.5em' }}>Time of Day</th>
                <th style={{ textAlign: 'left',  padding: '0.3em 0.5em' }}>Desc 1</th>
                <th style={{ textAlign: 'left',  padding: '0.3em 0.5em' }}>Desc 2</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Portion</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Cal</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Carb</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Fat</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Protein</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>Fiber</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>GI</th>
                <th style={{ textAlign: 'left',  padding: '0.3em 0.5em' }}>Note</th>
              </tr>
            </thead>
            <tbody>
              {editRows.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    background: idx % 2 === 0 ? '#23272b' : '#1f2226',
                    borderBottom: '1px solid #3b4144',
                  }}
                >
                  {/* Delete button */}
                  <td style={{ textAlign: 'center', padding: '0.2em 0.3em' }}>
                    <button
                      onClick={() => handleDeleteRow(idx)}
                      title="Remove row"
                      style={{ background: 'none', border: 'none', color: '#ed5b5b', cursor: 'pointer', fontSize: '1em', padding: '0 4px' }}
                    >✕</button>
                  </td>
                  {/* Include-in-totals checkbox */}
                  <td style={{ textAlign: 'center', padding: '0.2em 0.3em' }}>
                    <input type="checkbox" checked={checkedRows.has(idx)} onChange={() => handleCheckbox(idx)} />
                  </td>
                  {/* Time of day */}
                  <td style={{ padding: '0.2em 0.3em' }}>
                    <select
                      value={item.time_of_day || ''}
                      onChange={e => handleCellChange(idx, 'time_of_day', e.target.value)}
                      className="my-input-class"
                      style={{ fontSize: '0.85em', minWidth: 95 }}
                    >
                      {TIME_OF_DAY_OPTIONS.map(t => (
                        <option key={t} value={t}>{t || '—'}</option>
                      ))}
                    </select>
                  </td>
                  {/* Desc1 (read-only display) */}
                  <td style={{ padding: '0.2em 0.4em', color: '#aaa', fontSize: '0.88em' }}>{item.desc1}</td>
                  {/* Desc2 editable */}
                  <td style={{ padding: '0.2em 0.3em' }}>
                    <input
                      type="text"
                      value={item.desc2 ?? ''}
                      onChange={e => handleCellChange(idx, 'desc2', e.target.value)}
                      style={{ width: 140 }}
                      className="my-input-class"
                    />
                  </td>
                  {/* Portion editable — recalculates all nutrients */}
                  <td style={{ textAlign: 'right', padding: '0.2em 0.3em' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.portion ?? ''}
                      onChange={e => handlePortionChange(idx, e.target.value)}
                      style={{ width: 60, textAlign: 'center' }}
                      className="my-input-class"
                    />
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>
                    {item.calories !== undefined ? Math.round(item.calories) : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>
                    {item.carb !== undefined ? Number(item.carb.toFixed(1)) : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>
                    {item.fat !== undefined ? Number(item.fat.toFixed(1)) : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>
                    {item.protein !== undefined ? Number(item.protein.toFixed(1)) : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.5em' }}>
                    {item.fiber !== undefined ? Number(item.fiber.toFixed(1)) : ''}
                  </td>
                  <td style={{ textAlign: 'right', padding: '0.2em 0.3em' }}>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={item.GI ?? ''}
                      onChange={e => handleCellChange(idx, 'GI', e.target.value)}
                      style={{ width: 45, textAlign: 'center' }}
                      className="my-input-class"
                    />
                  </td>
                  <td style={{ padding: '0.2em 0.3em' }}>
                    <input
                      type="text"
                      value={item.note ?? ''}
                      onChange={e => handleCellChange(idx, 'note', e.target.value)}
                      style={{ width: 110 }}
                      className="my-input-class"
                    />
                  </td>
                </tr>
              ))}

              {/* Totals row */}
              {editRows.length > 0 && (
                <tr style={{ background: '#32232c', color: '#c6a3dd', fontWeight: 'bold', borderTop: '2px solid #725e5e' }}>
                  <td colSpan={5} style={{ padding: '0.3em 0.5em' }}>Totals</td>
                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{totals.portionTot ? totals.portionTot.toFixed(2) : '0.00'}</td>                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{Math.round(totals.caloriesTot)}</td>
                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{Math.round(totals.carbTot)}</td>
                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{Math.round(totals.fatTot)}</td>
                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{Math.round(totals.proteinTot)}</td>
                  <td style={{ textAlign: 'right', padding: '0.3em 0.5em' }}>{Math.round(totals.fiberTot)}</td>
                  <td colSpan={2}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '0.5em' }}>
          <button style={btnStyle} onClick={handleAddBlankRow}>+ Add Blank Row</button>
        </div>
      </div>

      {/* ── Breakdown by Food Group ── */}
      {groupedByDesc1.length > 0 && (
        <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', marginBottom: '1em' }}>
          <h3 style={{ color: '#52e87a', margin: '0 0 0.5em 0' }}>Breakdown by Food Group</h3>
          <p style={{ color: '#aaa', fontSize: '0.85em', margin: '0 0 0.5em 0' }}>
            Click a group row to expand / collapse details.
          </p>
          <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ color: '#f7c1c1', background: '#3b4144' }}>
                <th style={{ textAlign: 'left',  padding: '0.3em 0.6em' }}>Group</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Portion</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Cal</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Carb</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Fat</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Protein</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>Fiber</th>
              </tr>
            </thead>
            <tbody>
              {groupedByDesc1.map(({ desc1, rows, sub }) => (
                <React.Fragment key={desc1}>
                  {/* Group summary row (clickable) */}
                  <tr
                    style={{ background: '#2a2a33', cursor: 'pointer', borderBottom: '1px solid #725e5e' }}
                    onClick={() => toggleGroup(desc1)}
                  >
                    <td style={{ padding: '0.3em 0.6em', color: '#c6a3dd', fontWeight: 'bold' }}>
                      {expandedGroups.has(desc1) ? '▼' : '▶'} {desc1}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{sub.portionTot.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(sub.caloriesTot)}</td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(sub.carbTot)}</td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(sub.fatTot)}</td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(sub.proteinTot)}</td>
                    <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(sub.fiberTot)}</td>
                  </tr>
                  {/* Detail rows (when expanded) */}
                  {expandedGroups.has(desc1) && rows.map((row, i) => (
                    <tr key={i} style={{ background: '#23272b', borderBottom: '1px solid #3b4144' }}>
                      <td style={{ padding: '0.2em 0.6em 0.2em 1.8em', color: '#aaa' }}>{row.desc2}</td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.portion?.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.calories !== undefined ? Math.round(row.calories) : ''}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.carb !== undefined ? Number(row.carb.toFixed(1)) : ''}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.fat !== undefined ? Number(row.fat.toFixed(1)) : ''}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.protein !== undefined ? Number(row.protein.toFixed(1)) : ''}
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.2em 0.6em', color: '#aaa' }}>
                        {row.fiber !== undefined ? Number(row.fiber.toFixed(1)) : ''}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {/* Grand total row */}
              <tr style={{ background: '#32232c', color: '#c6a3dd', fontWeight: 'bold', borderTop: '2px solid #725e5e' }}>
                <td style={{ padding: '0.3em 0.6em' }}>Grand Total</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{totals.portionTot.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(totals.caloriesTot)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(totals.carbTot)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(totals.fatTot)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(totals.proteinTot)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.6em' }}>{Math.round(totals.fiberTot)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Per 100g ── */}
      {editRows.length > 0 && (
        <div style={{ marginBottom: '1em' }}>
          <h3 style={{ color: '#52e87a', margin: '0 0 0.5em 0' }}>Per 100g (whole plan)</h3>
          <table style={{ fontSize: '0.9em', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>100g</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>Calories</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>Carb</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>Fat</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>Protein</th>
                <th style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>Fiber</th>
              </tr>
              <tr style={{ background: '#32232c', color: '#c6a3dd' }}>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>100g</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>{Math.round(per100g.caloriesPer100g)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>{Math.round(per100g.carbPer100g)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>{Math.round(per100g.fatPer100g)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>{Math.round(per100g.proteinPer100g)}</td>
                <td style={{ textAlign: 'right', padding: '0.3em 0.8em' }}>{Math.round(per100g.fiberPer100g)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── Nutrition Details (Lipids, Minerals, Vitamins) ── */}
      {nutritionDetailsLoading && <div style={{ marginBottom: '1em' }}><Spinner size={20} /></div>}
      {!nutritionDetailsLoading && nutritionDetails && (() => {
        const LABELS: Record<string, string> = {
          omega3: 'Omega-3 (g)', omega6: 'Omega-6 (g)', cholesterol_mg: 'Cholesterol (mg)',
          sodium_mg: 'Sodium (mg)', potassium_mg: 'Potassium (mg)', calcium_mg: 'Calcium (mg)',
          iron_mg: 'Iron (mg)', magnesium_mg: 'Magnesium (mg)', iodine_mcg: 'Iodine (mcg)',
          manganese_mg: 'Manganese (mg)', selenium_mcg: 'Selenium (mcg)', zinc_mg: 'Zinc (mg)',
          vit_a_mcg: 'Vitamin A (mcg)', vit_b1_mg: 'Vitamin B1 (mg)', vit_b2_mg: 'Vitamin B2 (mg)',
          vit_b3_mg: 'Vitamin B3 (mg)', vit_b5_mg: 'Vitamin B5 (mg)', vit_b6_mg: 'Vitamin B6 (mg)',
          vit_b12_mcg: 'Vitamin B12 (mcg)', biotin_mcg: 'Biotin (mcg)', choline_mg: 'Choline (mg)',
          folate_mcg: 'Folate (mcg)', vit_c_mg: 'Vitamin C (mg)', vit_d_mcg: 'Vitamin D (mcg)',
          vit_e_mg: 'Vitamin E (mg)', vit_k_mcg: 'Vitamin K (mcg)',
        };

        const renderSection = (title: string, cols: string[]) => (
          <div style={{ marginBottom: '1em' }}>
            <h4 style={{ color: '#f7c1c1', margin: '0 0 4px 0' }}>{title}</h4>
            <table style={{ fontSize: '0.9em', borderCollapse: 'collapse', width: 320 }}>
              <thead>
                <tr style={{ background: '#3b4144', color: '#f7c1c1' }}>
                  <th style={{ textAlign: 'left', padding: '4px 12px' }}>Nutrient</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>Per 100g</th>
                  <th style={{ textAlign: 'right', padding: '4px 12px' }}>% RDA</th>
                </tr>
              </thead>
              <tbody>
                {cols.map((col, i) => {
                  const val = nutritionDetails.per100g[col];
                  const rda = RDA[col];
                  const pct = val && rda ? Math.round((val / rda) * 100) : null;
                  return (
                    <tr key={col} style={{ background: i % 2 === 0 ? '#32232c' : '#3b2d36', color: '#c6a3dd' }}>
                      <td style={{ textAlign: 'left', padding: '3px 12px' }}>{LABELS[col] ?? col}</td>
                      <td style={{ textAlign: 'right', padding: '3px 12px' }}>{val === 0 ? '—' : val}</td>
                      <td style={{ textAlign: 'right', padding: '3px 12px' }}>{pct !== null ? `${pct}%` : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        return (
          <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', marginBottom: '1em', display: 'flex', gap: '2em', flexWrap: 'wrap' }}>
            {renderSection('Lipids & Minerals', nutritionDetails.lipidCols)}
            {renderSection('Vitamins', nutritionDetails.vitaminCols)}
          </div>
        );
      })()}

      {/* ── Save / Delete ── */}
      <div style={{ borderTop: '1px solid #725e5e', paddingTop: '1em', display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
        <button className="globalButton" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Plan'}
        </button>
        {isSaving && <Spinner size={20} />}
        {planName && (
          <button
            style={{ ...btnStyle, color: '#ed5b5b', borderColor: '#ed5b5b' }}
            onClick={handleDeletePlan}
          >
            Delete Plan
          </button>
        )}
        {message && (
          <span style={{ color: '#c6a3dd', background: '#32232c', borderRadius: 6, padding: '4px 14px', border: '1px solid #725e5e' }}>
            {message}
          </span>
        )}
      </div>

    </div>
  );
}
