// pages/database/index.tsx
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import DatabaseView from './database_view';
import styles from '../../styles/homepage.module.scss';

const DatabasePage = () => {
  const [query, setQuery] = useState('SELECT * FROM nutrition;');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunQuery = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/database_related/db_query', { query });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
      setResult(null);
    }
    setLoading(false);
  };

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
        className={styles.queryBox}
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={4}
        cols={60}
        style={{ marginBottom: 12 }}
      />
      <br />
      <button onClick={handleRunQuery} disabled={loading}>
        {loading ? 'Running...' : 'Run Query'}
      </button>
      <div style={{ marginTop: 24 }}>
        <DatabaseView result={result} error={error} loading={loading} />
      </div>
    </div>
  );
};

export default DatabasePage;
