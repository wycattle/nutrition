/**
 * pages/database/database_view.tsx
 * Table and error display for database results
 */
// pages/database/database_view.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../styles/Meal_styles.module.scss';


interface DatabaseViewProps {
  result: any;
  error: string;
  loading: boolean;
  userId?: string;
}


const DatabaseView: React.FC<DatabaseViewProps> = ({ result, error, loading, userId }) => {
  const [editRows, setEditRows] = useState<any[]>(result ? result.map((row: any) => ({ ...row })) : []);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  // Refs for focusing the first editable cell in each row
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
  // Checkbox handlers
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '32px 0 24px 24px' }}>
      <div className="spinner" style={{ width: 32, height: 32, border: '4px solid #c6a3dd', borderTop: '4px solid #32232c', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '1.2em', color: '#c6a3dd' }}>Calculating...</span>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!result) return <div>No data to display.</div>;

  // Editable table logic (like recipe_view)
  const columns = editRows.length > 0 ? Object.keys(editRows[0]) : [];
  const displayColumns = columns.filter(col => col !== 'id');

  function handleCellChange(rowIdx: number, colId: string, value: string) {
    setEditRows(prev => prev.map((row, i) =>
      i === rowIdx ? { ...row, [colId]: value } : row
    ));
  }

  async function handleSaveRow(idx: number) {
    try {
      const row = editRows[idx];
      const payload = { ...row, user_id: userId || row.user_id };
      await axios.post('/api/database_related/db_query', { action: row.id ? 'update' : 'insert', row: payload });
      setMessage('Row saved!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error saving row.');
    }
  }

  async function handleAddRow() {
    const emptyRow: any = {};
    columns.forEach(col => {
      if (col === 'user_id') emptyRow[col] = userId || '';
      else emptyRow[col] = '';
    });
    setEditRows(prev => [...prev, emptyRow]);
  }

  async function handleDeleteRow(idx: number) {
    try {
      const row = editRows[idx];
      await axios.post('/api/database_related/db_query', { action: 'delete', row });
      setEditRows(prev => prev.filter((_, i) => i !== idx));
      setMessage('Row deleted!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Error deleting row.');
    }
  }

  return (
    <div>
      <button
        className="globalButton"
        style={{ marginBottom: 12, padding: '6px 18px', fontSize: '1.1em' }}
        onClick={handleAddRow}
      >
        Add Row
      </button>
      {message && (
        <span style={{ marginLeft: 16, color: '#c6a3dd', background: '#32232c', borderRadius: '6px', padding: '4px 12px', border: '1px solid #725e5e' }}>{message}</span>
      )}
      <div style={{ width: '100%', minWidth: 900, maxWidth: '100%', marginLeft: 0,
            marginRight: 0, maxHeight: 480, overflowY: 'auto',
            overflowX: 'hidden', position: 'relative' }}>
        <table className={styles['table-style']} style={{ fontSize: '1em', borderCollapse: 'collapse',
            width: '100%', minWidth: 900, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 40, minWidth: 40 }} />{/* checkbox */}
            {displayColumns.map((col, i) => {
              if (i === 0) return <col key={col} style={{ width: '12vw', minWidth: 120, maxWidth: 60 }} />; // desc1
              if (i === 1) return <col key={col} style={{ width: '18vw', minWidth: 180, maxWidth: 120 }} />; // desc2
              if (i === 2) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // portion
              if (i === 3) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // calories
              if (i === 4) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // carb
              if (i === 5) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // fat
              if (i === 6) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // protein
              if (i === 7) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // fiber
              if (i === 8) return <col key={col} style={{ width: '5vw', minWidth: 50, maxWidth: 70 }} />; // gi
              if (i === 9) return <col key={col} style={{ width: '8vw', minWidth: 100, maxWidth: 160 }} />; // note
              return <col key={col} style={{ width: 70, minWidth: 60, maxWidth: 70 }} />;
            })}
            <col style={{ width: '8vw', minWidth: 80, maxWidth: 120 }} />{/* actions */}
          </colgroup>
          <thead className={styles['table-style']} style={{ position: 'sticky', top: 0, zIndex: 2 }}>
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
  );
};


export default DatabaseView;
