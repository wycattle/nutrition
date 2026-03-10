/**
 * pages/database/index.tsx
 * Database view and query page for my_nutrition_app
 */
// pages/database/index.tsx
import React, { useState } from 'react';
import useSWR from 'swr';
import { fetcher, post } from '../../utils/helper';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DatabaseView from './database_view';
import styles from '../../styles/homepage.module.scss';


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
      <button className={styles.queryButton} onClick={handleRunQuery} disabled={isLoading || userLoading}>
        {isLoading
          ? 'Running...'
          : user?.id
            ? `Run Query for ${user.id}`
            : 'Run Query'}
      </button>
      <div style={{ marginTop: 24 }}>
        <DatabaseView result={result} error={error?.message || userError?.message || ''} loading={isLoading || userLoading} userId={user?.id} />
      </div>
    </div>
  );
};

export default DatabasePage;
