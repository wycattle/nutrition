/**
 * pages/database/index.tsx
 * Database view and query page for my_nutrition_app
 */
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { fetcher, post } from '../../utils/helper';
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
    fetcher
  );

  // Default query for user's nutrition table
  React.useEffect(() => {
    if (user?.id) {
      const userQuery = `SELECT id, desc1, desc2, portion, calories, carb, fat, protein, fiber, gi, note FROM user_nutrition WHERE user_id = '${user.id}' ORDER BY desc1, desc2;`;
      setQuery(userQuery);
    }
  }, [user]);

  // Run query with SWR (manual trigger)
  const { data: result, error, isLoading, mutate } = useSWR(
    query ? ['/api/database_related/db_query', query] : null,
    ([url, q]) => postFetcher(url, q),
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  const handleRunQuery = () => {
    if (query) mutate();
  };

  // DatabaseView state
  const [editRows, setEditRows] = useState<any[]>(result ? result.map((row: any) => ({ ...row })) : []);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [dbMessage, setDbMessage] = useState('');
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (Array.isArray(result) && result.length > 0) {
      setEditRows(result.map((row: any) => ({ ...row })));
    } else {
      setEditRows([]);
    }
    setSelectedRows([]);
    setSelectAll(false);
  }, [result]);

  const handleRowSelect = (idx: number) => {
    setSelectedRows(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
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

  // Focus the first editable cell of the last row when a row is added
  useEffect(() => {
    if (editRows.length > 0) {
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
    setEditRows(prev => prev.map((row, i) =>
      i === rowIdx ? { ...row, [colId]: value } : row
    ));
  }

  async function handleSaveRow(idx: number) {
    try {
      const row = editRows[idx];
      const payload = { ...row, user_id: user?.id || row.user_id };
      await axios.post('/api/database_related/db_query', { action: row.id ? 'update' : 'insert', row: payload });
      setDbMessage('Row saved!');
      setTimeout(() => setDbMessage(''), 2000);
    } catch (err) {
      setDbMessage('Error saving row.');
    }
  }

  async function handleAddRow() {
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
      <div style={{ marginBottom: 16 }}>
        <Link href="/">
          <span style={{ textDecoration: 'none',
            color: '#0070f3',
            fontWeight: 'bold',
            fontSize: '1.1em' }}>Back to Home Page</span>
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
            <div style={{ width: '100%', minWidth: 900, maxWidth: '100%', marginLeft: 0,
                  marginRight: 0, maxHeight: 480, overflowY: 'auto',
                  overflowX: 'hidden', position: 'relative' }}>
              <table className={tableStyles['table-style']} style={{ fontSize: '1em', borderCollapse: 'collapse',
                  width: '100%', minWidth: 900, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: 40, minWidth: 40 }} />{/* checkbox */}
                  {displayColumns.map((col, i) => {
                    if (i === 0) return <col key={col} style={{ width: '12vw', minWidth: 120, maxWidth: 60 }} />;
                    if (i === 1) return <col key={col} style={{ width: '18vw', minWidth: 180, maxWidth: 120 }} />;
                    if (i === 2) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 3) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 4) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 5) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 6) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 7) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 8) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />;
                    if (i === 9) return <col key={col} style={{ width: '8vw', minWidth: 100, maxWidth: 160 }} />;
                    return <col key={col} style={{ width: 70, minWidth: 60, maxWidth: 70 }} />;
                  })}
                  <col style={{ width: '8vw', minWidth: 80, maxWidth: 120 }} />{/* actions */}
                </colgroup>
                <thead className={tableStyles['table-style']} style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                  <tr>
                    <th style={{ padding: '0.3em 0.5em', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', textAlign: 'center', position: 'sticky', top: 0, zIndex: 3 }}>
                      <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                    </th>
                    {displayColumns.map((col) => (
                      <th key={col} style={{ padding: '0.3em 0.5em', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', textAlign: 'left', position: 'sticky', top: 0, zIndex: 3 }}>{col}</th>
                    ))}
                    <th style={{ padding: '0.3em 0.5em', background: '#222121', border: '1px solid #000', fontWeight: 600, fontSize: '1em', textAlign: 'center', position: 'sticky', top: 0, zIndex: 3 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {editRows.map((row, idx) => {
                    const isSelected = selectedRows.includes(idx);
                    return (
                      <tr
                        key={idx}
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
                        <td style={{ padding: '0.2em 0.5em', border: '1px solid #000', fontSize: '1em', background: 'inherit', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <button
                            className="my-button-class"
                            style={{ marginRight: 8, fontSize: '0.95em', padding: '2px 10px', height: '24px' }}
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
