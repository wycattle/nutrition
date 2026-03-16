/**
 * pages/index.tsx
 * Entry point for the Next.js app, re-exports homepage
 */

import React from 'react';
import Home, { getServerSideProps } from './homepage';

export { getServerSideProps };

const IndexPage = (props: any) => {
  return <Home {...props} />;
};

export default IndexPage;


