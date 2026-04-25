/**
 * utils/Spinner.tsx
 * Simple reusable spinner component
 */

import React from 'react';

const Spinner: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <div style={{ 
    display: 'inline-block', 
    width: size, 
    height: size, 
    border: '3px solid #f3f3f3', 
    borderTop: '3px solid #32232c', 
    borderRadius: '50%', 
    animation: 'spin 0.5s linear infinite' 
  }}>
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export default Spinner;