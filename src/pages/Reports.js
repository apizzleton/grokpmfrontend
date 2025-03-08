import React, { useContext } from 'react';
import AppContext from '../context/AppContext'; // Updated to default import

function Reports() {
  const context = useContext(AppContext);

  return (
    <div>
      <h1>Reports</h1>
      {/* Example usage of context; adjust based on your actual implementation */}
      {context ? <p>Context is available</p> : <p>Loading...</p>}
    </div>
  );
}

export default Reports;