/**
 * pages/database/index.tsx
 * Database view and query page for my_nutrition_app
 */
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { fetcher, post } from '../../utils/swrHelper';
import { defaultSwrOptions } from '../../utils/swrHelper';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import homepageStyles from '../../styles/homepage.module.scss';
import tableStyles from '../../styles/Meal_styles.module.scss';
import Spinner from '../../utils/Spinner';


// Helper to POST a query string to a URL and return JSON
const postFetcher = (url: string, query: string) => post(url, { query });

const DatabasePage = () => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState('');
  // Get userId with SWR
  const { data: user, error: userError, isLoading: userLoading } = useSWR(
    session?.user?.email ? '/api/user/getUserId' : null,
    fetcher,
    defaultSwrOptions
  );

  const [tableView, setTableView] = useState<'basic' | 'extended-lipids' | 'vitamins'>('basic');

  function buildQuery(view: 'basic' | 'extended-lipids' | 'vitamins', userId: string) {
    const base = `FROM user_nutrition WHERE user_id = '${userId}' ORDER BY desc1, desc2;`;
    if (view === 'extended-lipids') {
      return `SELECT id, desc1, desc2, omega3, omega6, cholesterol_mg, calcium_mg, iodine_mcg, iron_mg, magnesium_mg, manganese_mg, potassium_mg, selenium_mcg, sodium_mg, zinc_mg ${base}`;
    }
    if (view === 'vitamins') {
      return `SELECT id, desc1, desc2, vit_a_mcg, vit_b1_mg, vit_b2_mg, vit_b3_mg, vit_b5_mg, vit_b6_mg, vit_b12_mcg, biotin_mcg, choline_mg, folate_mcg, vit_c_mg, vit_d_mcg, vit_e_mg, vit_k_mcg ${base}`;
    }
    return `SELECT id, desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note ${base}`;
  }

  // Default query for user's nutrition table
  React.useEffect(() => {
    if (user?.id) {
      setQuery(buildQuery(tableView, user.id));
    }
  }, [user]);

  // Run query with SWR (manual trigger)
  const { data: result, error, isLoading, mutate } = useSWR(
    query ? ['/api/database_related/db_query', query] : null,
    ([url, q]) => postFetcher(url, q),
    defaultSwrOptions
  );

  const handleRunQuery = () => {
    if (query) mutate();
  };

  function handleToggleView(view: 'basic' | 'extended-lipids' | 'vitamins') {
    if (!user?.id) return;
    setTableView(view);
    const q = buildQuery(view, user.id);
    setQuery(q);
    setTimeout(() => mutate(), 0);
  }

  // DatabaseView state
  const [editRows, setEditRows] = useState<any[]>(result ? result.map((row: any) => ({ ...row })) : []);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const prevEditRowsLength = React.useRef<number>(0);
  const addRowPending = React.useRef<boolean>(false);
  const rowRefs = React.useRef<(HTMLTableRowElement | null)[]>([]);
  const [dbMessage, setDbMessage] = useState('');
  const lastFocusedIdRef = React.useRef<string>('');
  const [dirtyRows, setDirtyRows] = useState<Set<number>>(new Set());
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Sortable columns: sortCol is the column key, sortDir is 'asc'|'desc'
  // Sorting is display-only — editRows remains the source of truth for edits/saves.
  // sortedRows maps display index -> editRows index so saves always hit the right row.
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSortCol = (col: string) => {
    setSortCol(prev => {
      if (prev === col) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return col; }
      setSortDir('asc');
      return col;
    });
  };

  // sortedIndexes[displayIdx] = editRows index
  const sortedIndexes: number[] = React.useMemo(() => {
    const indexes = editRows.map((_, i) => i);
    if (!sortCol) return indexes;
    return [...indexes].sort((a, b) => {
      const va = editRows[a][sortCol];
      const vb = editRows[b][sortCol];
      const numA = parseFloat(va), numB = parseFloat(vb);
      const isNum = !isNaN(numA) && !isNaN(numB);
      let cmp = isNum ? numA - numB : String(va ?? '').localeCompare(String(vb ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [editRows, sortCol, sortDir]);

  // Resizable columns
  const DEFAULT_WIDTHS = (cols: string[]) => cols.map((_, i) => i === 0 ? 120 : i === 1 ? 220 : 80);
  const [colWidths, setColWidths] = useState<number[]>([]);
  const resizingRef = React.useRef<{ colIdx: number; startX: number; startW: number } | null>(null);
  // colKeyRef tracks the previous column set (e.g. "desc1,desc2,portion,...").
  // We reset colWidths ONLY when the column set actually changes (i.e. switching Basic/Lipids/Vitamins views),
  // NOT on every row edit. This avoids jarring layout resets mid-edit.
  // IMPORTANT: never put a computed expression like Object.keys(...).join(',') directly in the useEffect
  // dependency array — React evaluates it on every render and the timing is unreliable, causing
  // DEFAULT_WIDTHS to fire during row edits and reset column widths unexpectedly.
  const colKeyRef = React.useRef<string>('');

  useEffect(() => {
    const cols = editRows.length > 0 ? Object.keys(editRows[0]).filter(c => c !== 'id') : [];
    if (cols.length > 0) {
      const colKey = cols.join(',');
      if (colKey !== colKeyRef.current) {
        colKeyRef.current = colKey;
        setColWidths(DEFAULT_WIDTHS(cols));
      }
    }
  }, [editRows]);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!resizingRef.current) return;
      const { colIdx, startX, startW } = resizingRef.current;
      const newW = Math.max(40, startW + e.clientX - startX);
      setColWidths(prev => { const next = [...prev]; next[colIdx] = newW; return next; });
    }
    function onMouseUp() { resizingRef.current = null; document.body.style.cursor = ''; }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
  }, []);

  useEffect(() => {
    if (Array.isArray(result) && result.length > 0) {
      const newRows = result.map((row: any) => ({ ...row }));
      setEditRows(newRows);
      // Restore selected indexes based on previously selected IDs
      const currentSelectedIds = selectedIds;
      const newSelected = newRows.reduce((acc: number[], row: any, idx: number) => {
        if (row.id && currentSelectedIds.has(String(row.id))) acc.push(idx);
        return acc;
      }, []);
      setSelectedRows(newSelected);
      // Scroll to last focused/edited row (or first selected) after view switch
      const lastId = lastFocusedIdRef.current;
      const scrollTargetIdx = lastId
        ? newRows.findIndex((row: any) => String(row.id) === lastId)
        : newSelected.length > 0 ? newSelected[0] : -1;
      if (scrollTargetIdx >= 0) {
        setTimeout(() => {
          rowRefs.current[scrollTargetIdx]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 0);
      }
    } else {
      setEditRows([]);
      setSelectedRows([]);
    }
    setSelectAll(false);
    setDirtyRows(new Set());
  }, [result]);  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowSelect = (idx: number) => {
    const rowId = String(editRows[idx]?.id ?? '');
    if (rowId) lastFocusedIdRef.current = rowId;
    setSelectedRows(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
      setSelectAll(false);
    } else {
      setSelectedRows(editRows.map((_, idx) => idx));
      setSelectAll(true);
    }
  };

  // Focus the first editable cell of the last row ONLY when a row is added
  useEffect(() => {
    const prev = prevEditRowsLength.current;
    prevEditRowsLength.current = editRows.length;
    if (editRows.length > 0 && editRows.length > prev && addRowPending.current) {
      addRowPending.current = false;
      const lastIdx = editRows.length - 1;
      const dispCols = Object.keys(editRows[0]).filter(c => c !== 'id');
      let firstEditableColIdx = dispCols.findIndex(col => col !== 'uuid' && col !== 'user_id');
      if (firstEditableColIdx === -1) firstEditableColIdx = 0;
      const cellInputRefIndex = lastIdx * dispCols.length + firstEditableColIdx;
      setTimeout(() => {
        if (inputRefs.current[cellInputRefIndex]) {
          inputRefs.current[cellInputRefIndex]?.focus();
        }
      }, 0);
    }
  }, [editRows.length]);

  function handleCellChange(rowIdx: number, colId: string, value: string) {
    const rowId = String(editRows[rowIdx]?.id ?? '');
    if (rowId) lastFocusedIdRef.current = rowId;
    setEditRows(prev => prev.map((row, i) =>
      i === rowIdx ? { ...row, [colId]: value } : row
    ));
    setDirtyRows(prev => new Set(prev).add(rowIdx));
  }

  async function handleSaveRow(idx: number) {
    try {
      const row = editRows[idx];
      const payload = { ...row, user_id: user?.id || row.user_id };
      await axios.post('/api/database_related/db_query', { action: row.id ? 'update' : 'insert', row: payload });
      setDirtyRows(prev => { const next = new Set(prev); next.delete(idx); return next; });
      setDbMessage('Row saved!');
      setTimeout(() => setDbMessage(''), 2000);
    } catch (err) {
      setDbMessage('Error saving row.');
    }
  }

  async function handleAddRow() {
    addRowPending.current = true;
    const columns = editRows.length > 0 ? Object.keys(editRows[0]) : [];
    const emptyRow: any = {};
    columns.forEach(col => {
      if (col === 'user_id') emptyRow[col] = user?.id || '';
      else emptyRow[col] = '';
    });
    setEditRows(prev => [...prev, emptyRow]);
  }

  async function handleDeleteRow(idx: number) {
    try {
      const row = editRows[idx];
      await axios.post('/api/database_related/db_query', { action: 'delete', row });
      setEditRows(prev => prev.filter((_, i) => i !== idx));
      setDbMessage('Row deleted!');
      setTimeout(() => setDbMessage(''), 2000);
    } catch (err) {
      setDbMessage('Error deleting row.');
    }
  }

  const loading = isLoading || userLoading;
  const errorMessage = error?.message || userError?.message || '';
  const columns = editRows.length > 0 ? Object.keys(editRows[0]) : [];
  const displayColumns = columns.filter(col => col !== 'id');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'inline-block' }}>
        <Link href="/">
          <span className="globalButton">Back to Home Page</span>
        </Link>
      </div>
      <h1>View/Modify Database</h1>
      <textarea
        className={homepageStyles.queryBox}
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={4}
        cols={60}
        style={{ marginBottom: 12 }}
      />
      <br />
      <button className={homepageStyles.queryButton} onClick={handleRunQuery} disabled={loading}>
        {isLoading
          ? 'Running...'
          : user?.id
            ? `Run Query for ${user.id}`
            : 'Run Query'}
      </button>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 4 }}>
        <button
          className="globalButton"
          style={{ padding: '6px 18px', fontSize: '1.1em', opacity: tableView === 'basic' ? 1 : 0.5 }}
          onClick={() => handleToggleView('basic')}
        >
          Basic
        </button>
        <button
          className="globalButton"
          style={{ padding: '6px 18px', fontSize: '1.1em', opacity: tableView === 'extended-lipids' ? 1 : 0.5 }}
          onClick={() => handleToggleView('extended-lipids')}
        >
          Lipids &amp; Minerals
        </button>
        <button
          className="globalButton"
          style={{ padding: '6px 18px', fontSize: '1.1em', opacity: tableView === 'vitamins' ? 1 : 0.5 }}
          onClick={() => handleToggleView('vitamins')}
        >
          Vitamins
        </button>
      </div>
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0 24px 24px' }}>
            <Spinner />
            <span style={{ fontSize: '1.2em', color: '#c6a3dd' }}>Calculating...</span>
          </div>
        ) : errorMessage ? (
          <div style={{ color: 'red' }}>{errorMessage}</div>
        ) : !result ? (
          <div>No data to display.</div>
        ) : (
          <div>
            <button
              className="globalButton"
              style={{ marginBottom: 12, padding: '6px 18px', fontSize: '1.1em' }}
              onClick={handleAddRow}
            >
              Add Row
            </button>
            {dbMessage && (
              <span style={{ marginLeft: 16, color: '#c6a3dd', background: '#32232c', borderRadius: '6px', padding: '4px 12px', border: '1px solid #725e5e' }}>{dbMessage}</span>
            )}
            <div style={{ width: '100%', maxHeight: 480, overflowY: 'auto', overflowX: 'auto', position: 'relative' }}>
              <table className={tableStyles['table-style']} style={{ fontSize: '0.9em', borderCollapse: 'collapse',
                  tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 36 }} />{/* checkbox */}
                  {displayColumns.map((col, i) => (
                    <col key={col} style={{ width: colWidths[i] ?? 68 }} />
                  ))}
                  <col style={{ width: 130 }} />{/* actions */}
                </colgroup>
                <thead className={tableStyles['table-style']} style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ padding: '0.3em 0.5em', background: '#222121', border: '1px solid #000', 
                      fontWeight: 600, fontSize: '1em', textAlign: 'center', position: 'sticky', top: 0, zIndex: 3 }}>
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    {displayColumns.map((col, i) => (
                      <th key={col} style={{ padding: '0', background: '#222121', 
                      border: '1px solid #000', fontWeight: 600, fontSize: '1em', 
                      textAlign: 'left', position: 'sticky', top: 0, zIndex: 3, 
                      userSelect: 'none', minWidth: 48 }}>
                        <div
                          onClick={() => handleSortCol(col)}
                          style={{ position: 'relative', padding: '0.3em 0.5em', overflow: 'hidden', whiteSpace: 'normal', overflowWrap: 'break-word', cursor: 'pointer' }}>
                          {col.replace(/_/g, '_\u200B')}{sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                          <div
                            onMouseDown={e => {
                              e.preventDefault();
                              resizingRef.current = { colIdx: i, startX: e.clientX, startW: colWidths[i] ?? 68 };
                              document.body.style.cursor = 'col-resize';
                            }}
                            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 5, background: 'rgba(198,163,221,0.18)', borderRight: '2px solid #725e5e' }}
                          />
                        </div>
                      </th>
                    ))}
                    <th style={{ padding: '0.3em 0.5em', background: '#222121', 
                      border: '1px solid #000', fontWeight: 600, fontSize: '1em', 
                      textAlign: 'center', position: 'sticky', top: 0, right: 0, zIndex: 4 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedIndexes.map((editIdx, displayIdx) => {
                    const row = editRows[editIdx];
                    const idx = editIdx; // always use editIdx for edits/saves/deletes
                    const isSelected = selectedRows.includes(editIdx);
                    return (
                      <tr
                        ref={el => { rowRefs.current[editIdx] = el; }}
                        key={editIdx}
                        style={{
                          height: '32px',
                          background: isSelected ? '#3a2e4d' : (idx % 2 === 0 ? '#23272b' : '#1f2226'),
                          transition: 'background 0.2s'
                        }}
                      >
                        <td style={{ textAlign: 'center', border: '1px solid #000' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRowSelect(idx)}
                          />
                        </td>
                        {displayColumns.map((col, colIdx) => {
                          const numCols = ['portion', 'calories', 'carb', 'fat', 'protein', 'fiber', 'gi'];
                          const align = numCols.includes(col.toLowerCase()) ? 'right' : 'left';
                          const inputRefIndex = idx * displayColumns.length + colIdx;
                          return (
                            <td
                              key={col}
                              style={{
                                padding: '0.2em 0.5em',
                                border: '1px solid #000',
                                fontSize: '1em',
                                background: 'inherit',
                                textAlign: align as React.CSSProperties['textAlign'],
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {col === 'user_id' ? (
                                <span>{row[col]}</span>
                              ) : (
                                <input
                                  className="my-input-class"
                                  ref={el => { inputRefs.current[inputRefIndex] = el; }}
                                  style={{ width: '100%', fontSize: '1em', minHeight: '24px', padding: '2px 6px', background: 'inherit', border: 'none', textAlign: align as React.CSSProperties['textAlign'], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  value={row[col] ?? ''}
                                  onChange={e => handleCellChange(idx, col, e.target.value)}
                                />
                              )}
                            </td>
                          );
                        })}
                        <td style={{ padding: '0.2em 0.5em', border: '1px solid #000', fontSize: '1em', background: isSelected ? '#3a2e4d' : (idx % 2 === 0 ? '#23272b' : '#1f2226'), textAlign: 'center', position: 'sticky', right: 0, zIndex: 1, whiteSpace: 'nowrap' }}>
                          <button
                            className="my-button-class"
                            style={{
                              marginRight: 8, fontSize: '0.95em', padding: '2px 10px', height: '24px',
                              animation: dirtyRows.has(idx) ? 'saveBlink 0.8s step-start infinite' : 'none',
                              background: dirtyRows.has(idx) ? '#5a3a7a' : undefined,
                            }}
                            onClick={() => handleSaveRow(idx)}
                          >
                            Save
                          </button>
                          <button
                            className="my-button-class"
                            style={{ background: '#694242', color: '#ffd5d5', fontSize: '0.95em', padding: '2px 10px', height: '24px' }}
                            onClick={() => handleDeleteRow(idx)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabasePage;
