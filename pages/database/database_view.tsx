// pages/database/database_view.tsx
import React from 'react';

interface DatabaseViewProps {
  result: any;
  error: string;
  loading: boolean;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ result, error, loading }) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!result) return <div>No data to display.</div>;

  // If result is an array of objects, render as a table
  if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'object') {
    const columns = Object.keys(result[0]);
    return (
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '1em', lineHeight: 1.2 }}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} style={{ border: '1px solid #ccc', padding: '4px 8px', height: '28px' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.map((row: any, idx: number) => (
            <tr key={idx}>
              {columns.map(col => (
                <td key={col} style={{ border: '1px solid #ccc', padding: '4px 8px', height: '24px' }}>{row[col]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Otherwise, render as JSON
  return <pre>{JSON.stringify(result, null, 2)}</pre>;
};

export default DatabaseView;
