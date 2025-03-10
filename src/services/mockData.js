// Mock data service for development and testing when the backend is unavailable
const mockData = {
  properties: [
    {
      id: 1,
      name: 'Sunset Apartments',
      property_type: 'residential',
      status: 'active',
      value: 750000,
      owner_id: 1,
      addresses: [
        {
          id: 1,
          street: '123 Sunset Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          is_primary: true
        }
      ]
    },
    {
      id: 2,
      name: 'Downtown Office Building',
      property_type: 'commercial',
      status: 'active',
      value: 2500000,
      owner_id: 2,
      addresses: [
        {
          id: 2,
          street: '456 Main St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          is_primary: true
        }
      ]
    },
    {
      id: 3,
      name: 'Harbor Warehouse',
      property_type: 'industrial',
      status: 'inactive',
      value: 1200000,
      owner_id: 1,
      addresses: [
        {
          id: 3,
          street: '789 Harbor Dr',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          is_primary: true
        }
      ]
    }
  ],
  units: [
    {
      id: 1,
      unit_number: '101',
      address_id: 1,
      rent_amount: 1500,
      status: 'occupied',
      bedrooms: 2,
      bathrooms: 1,
      square_feet: 850
    },
    {
      id: 2,
      unit_number: '102',
      address_id: 1,
      rent_amount: 1600,
      status: 'vacant',
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 900
    },
    {
      id: 3,
      unit_number: '201',
      address_id: 1,
      rent_amount: 1800,
      status: 'occupied',
      bedrooms: 3,
      bathrooms: 2,
      square_feet: 1100
    }
  ],
  tenants: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-123-4567',
      unit_id: 1,
      lease_start_date: '2025-01-01',
      lease_end_date: '2025-12-31'
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '555-987-6543',
      unit_id: 3,
      lease_start_date: '2025-02-01',
      lease_end_date: '2026-01-31'
    }
  ],
  owners: [
    {
      id: 1,
      name: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '555-111-2222'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      phone: '555-333-4444'
    }
  ],
  maintenance: [
    {
      id: 1,
      title: 'Leaking Faucet',
      description: 'The kitchen faucet is leaking continuously',
      priority: 'medium',
      status: 'open',
      unit_id: 1,
      reported_date: '2025-03-01'
    },
    {
      id: 2,
      title: 'Broken Window',
      description: 'Window in living room is cracked and needs replacement',
      priority: 'high',
      status: 'in_progress',
      unit_id: 1,
      reported_date: '2025-03-05'
    },
    {
      id: 3,
      title: 'HVAC Maintenance',
      description: 'Annual HVAC system check and filter replacement',
      priority: 'low',
      status: 'completed',
      unit_id: 3,
      reported_date: '2025-02-15'
    }
  ]
};

// Helper function to generate new IDs for created items
const getNextId = (collection) => {
  return Math.max(...mockData[collection].map(item => item.id), 0) + 1;
};

// Mock API functions
export const getMockData = (endpoint) => {
  // Parse the endpoint to determine what data to return
  const parts = endpoint.split('/');
  const resource = parts[0];
  const id = parts.length > 1 ? parseInt(parts[1], 10) : null;

  if (!mockData[resource]) {
    return null;
  }

  if (id) {
    return mockData[resource].find(item => item.id === id) || null;
  }

  return [...mockData[resource]];
};

export const createMockData = (endpoint, data) => {
  const resource = endpoint.split('/')[0];
  
  if (!mockData[resource]) {
    return false;
  }

  const newItem = {
    ...data,
    id: getNextId(resource)
  };

  mockData[resource].push(newItem);
  return newItem;
};

export const updateMockData = (endpoint, data) => {
  const parts = endpoint.split('/');
  const resource = parts[0];
  const id = parseInt(parts[1], 10);

  if (!mockData[resource]) {
    return false;
  }

  const index = mockData[resource].findIndex(item => item.id === id);
  if (index === -1) {
    return false;
  }

  mockData[resource][index] = {
    ...mockData[resource][index],
    ...data,
    id // Ensure ID doesn't change
  };

  return mockData[resource][index];
};

export const deleteMockData = (endpoint) => {
  const parts = endpoint.split('/');
  const resource = parts[0];
  const id = parseInt(parts[1], 10);

  if (!mockData[resource]) {
    return false;
  }

  const index = mockData[resource].findIndex(item => item.id === id);
  if (index === -1) {
    return false;
  }

  mockData[resource].splice(index, 1);
  return true;
};

export default mockData;
