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
      console.log(`Fetching data from: ${API_BASE_URL}/${endpoint}`);
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  };

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      console.log(`${method.toUpperCase()} request to: ${API_BASE_URL}/${endpoint}`);
      let response;
      const url = `${API_BASE_URL}/${endpoint}`;

      switch (method.toLowerCase()) {
        case 'put':
          response = await axios.put(url, data);
          break;
        case 'delete':
          response = await axios.delete(url);
          console.log(`Delete response:`, response);
          
          // For delete operations, immediately update the local state
          if (endpoint.includes('/')) {
            const [resourceType, resourceId] = endpoint.split('/');
            const id = parseInt(resourceId);
            
            console.log(`Removing ${resourceType} with ID ${id} from state`);
            setState(prev => ({
              ...prev,
              [resourceType]: prev[resourceType].filter(item => item.id !== id)
            }));
          }
          break;
        default:
          response = await axios.post(url, data);
      }

      // Only refresh data for non-delete operations
      if (method.toLowerCase() !== 'delete') {
        await refreshData();
      }
      return response.data;
    } catch (error) {
      console.error(`Error ${method.toUpperCase()} ${endpoint}:`, error);
      console.error('Response:', error.response?.data);
      // Re-throw the error with the response error message if available
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  const refreshData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      console.log('Refreshing all data...');
      const [properties, units, tenants, owners, associations] = await Promise.all([
        fetchData('properties'),
        fetchData('units'),
        fetchData('tenants'),
        fetchData('owners'),
        fetchData('associations')
      ]);

      console.log('Data refreshed successfully');
      setState(prev => ({
        ...prev,
        properties: Array.isArray(properties) ? properties : [],
        units: Array.isArray(units) ? units : [],
        tenants: Array.isArray(tenants) ? tenants : [],
        owners: Array.isArray(owners) ? owners : [],
        associations: Array.isArray(associations) ? associations : [],
        loading: false
      }));
    } catch (error) {
      console.error('Error refreshing data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch data'
      }));
    }
  };

  const formatPropertyAddress = (property) => {
    if (!property?.addresses?.length) return 'No address available';
    const primaryAddress = property.addresses.find(addr => addr.is_primary) || property.addresses[0];
    return `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state} ${primaryAddress.zip}`;
  };

  const getPropertyAddresses = (property) => {
    if (!property?.addresses) return [];
    return property.addresses.map(addr => ({
      ...addr,
      label: `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`
    }));
  };

  const getUnitsForAddress = (addressId) => {
    if (!addressId || !state.units) return [];
    return state.units.filter(unit => unit.address_id === addressId);
  };

  useEffect(() => {
    refreshData();
  }, []);

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