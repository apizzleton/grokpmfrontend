import React from 'react';
import { useEffect, useState } from 'react';

function App() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    fetch('https://grokpm-backend.onrender.com/tenants')
      .then(res => res.json())
      .then(data => setTenants(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Grok Property Manager</h1>
      <h2>Tenants</h2>
      <ul>
        {tenants.map(tenant => (
          <li key={tenant.id}>
            {tenant.name} - Property #{tenant.property_id} - ${tenant.rent}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;