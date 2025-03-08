// C:\Users\AnthonyParadiso\Desktop\grokPMApp\frontend\src\context\AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create an Axios instance with base URL for cleaner code
const api = axios.create({
  baseURL: 'https://grokpmbackend-new.onrender.com/api', // Hyphen
  timeout: 10000,
});

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [owners, setOwners] = useState([]);
  const [associations, setAssociations] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoints = [
          'properties',
          'units',
          'tenants',
          'owners',
          'associations',
          'board-members',
          'accounts',
          'account-types',
          'transactions',
          'transaction-types',
          'payments',
        ];

        const responses = await Promise.all(
          endpoints.map(endpoint => api.get(`/${endpoint}`))
        );

        // Map responses to state setters
        const setters = [
          setProperties,
          setUnits,
          setTenants,
          setOwners,
          setAssociations,
          setBoardMembers,
          setAccounts,
          setAccountTypes,
          setTransactions,
          setTransactionTypes,
          setPayments,
        ];

        responses.forEach((res, index) => setters[index](res.data));
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      const cleanEndpoint = endpoint.replace(/^transactions\//, ''); // Handle nested transaction endpoints if any
      const response = await api[method](`/${cleanEndpoint}`, data);

      // Update state based on endpoint
      const stateMap = {
        'properties': setProperties,
        'units': setUnits,
        'tenants': setTenants,
        'owners': setOwners,
        'associations': setAssociations,
        'board-members': setBoardMembers,
        'accounts': setAccounts,
        'account-types': setAccountTypes,
        'transactions': setTransactions,
        'transaction-types': setTransactionTypes,
        'payments': setPayments,
      };

      const setter = stateMap[cleanEndpoint];
      if (setter) {
        setter(prev => [...prev, response.data]);
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        state: {
          properties,
          units,
          tenants,
          owners,
          associations,
          boardMembers,
          accounts,
          accountTypes,
          transactions,
          transactionTypes,
          payments,
          searchQuery,
          loading,
        },
        setSearchQuery,
        updateData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;