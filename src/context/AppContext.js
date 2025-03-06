// AppContext.js (Full Code)

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [properties, setProperties] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propRes, transRes, accRes, typeRes] = await Promise.all([
          axios.get('https://grokpmbackend.onrender.com/api/properties'),
          axios.get('https://grokpmbackend.onrender.com/api/transactions'),
          axios.get('https://grokpmbackend.onrender.com/api/accounts'),
          axios.get('https://grokpmbackend.onrender.com/api/transaction-types'),
        ]);
        setProperties(propRes.data);
        setTransactions(transRes.data);
        setAccounts(accRes.data);
        setTransactionTypes(typeRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      const url = `https://grokpmbackend.onrender.com/api/${endpoint.replace(/^transactions\//, '')}`;
      const response = await axios[method](url, data);
      if (endpoint.startsWith('properties')) setProperties([...properties, response.data]);
      if (endpoint.startsWith('units')) {
        const updatedProperties = properties.map(prop =>
          prop.id === response.data.propertyId ? { ...prop, units: [...(prop.units || []), response.data] } : prop
        );
        setProperties(updatedProperties);
      }
      if (endpoint.startsWith('transactions')) setTransactions([...transactions, response.data]);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      state: { properties, transactions, accounts, transactionTypes, searchQuery, loading },
      setSearchQuery,
      updateData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;