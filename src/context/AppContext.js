import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://grokpmbackend-new.onrender.com/api';

export const AppProvider = ({ children }) => {
  const [state, setState] = useState({
    properties: [],
    units: [],
    tenants: [],
    owners: [],
    associations: [],
    loading: true,
    error: null,
    searchQuery: ''
  });

  const fetchData = async (endpoint) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      let response;
      const url = `${API_BASE_URL}/${endpoint}`;

      switch (method.toLowerCase()) {
        case 'put':
          response = await axios.put(url, data);
          break;
        case 'delete':
          response = await axios.delete(url);
          break;
        default:
          response = await axios.post(url, data);
      }

      // Refresh the data after successful update
      await refreshData();
      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  };

  const refreshData = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const [properties, units, tenants, owners, associations] = await Promise.all([
        fetchData('properties'),
        fetchData('units'),
        fetchData('tenants'),
        fetchData('owners'),
        fetchData('associations')
      ]);

      setState(prev => ({
        ...prev,
        properties,
        units,
        tenants,
        owners,
        associations,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch data'
      }));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Helper function to format property address
  const formatPropertyAddress = (property) => {
    if (!property) return '';
    
    const primaryAddress = property.addresses?.find(addr => addr.is_primary) || property.addresses?.[0];
    if (!primaryAddress) return property.name || 'Unnamed Property';

    return `${property.name} - ${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip}`;
  };

  // Helper function to get all addresses for a property
  const getPropertyAddresses = (property) => {
    if (!property?.addresses) return [];
    return property.addresses.map(addr => ({
      id: addr.id,
      label: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`,
      isPrimary: addr.is_primary
    }));
  };

  // Helper function to get units for a specific address
  const getUnitsForAddress = (addressId) => {
    if (!addressId) return [];
    return state.units.filter(unit => unit.address_id === addressId);
  };

  const contextValue = {
    state,
    setState,
    updateData,
    refreshData,
    formatPropertyAddress,
    getPropertyAddresses,
    getUnitsForAddress
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;