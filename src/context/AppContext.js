// C:\Users\AnthonyParadiso\Desktop\grokPMApp\frontend\src\context\AppContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
        const [propRes, unitRes, tenantRes, ownerRes, assocRes, boardRes, accRes, accTypeRes, transRes, transTypeRes, payRes] = await Promise.all([
          axios.get('https://grokpmbackend_new.onrender.com/api/properties'),
          axios.get('https://grokpmbackend_new.onrender.com/api/units'),
          axios.get('https://grokpmbackend_new.onrender.com/api/tenants'),
          axios.get('https://grokpmbackend_new.onrender.com/api/owners'),
          axios.get('https://grokpmbackend_new.onrender.com/api/associations'),
          axios.get('https://grokpmbackend_new.onrender.com/api/board-members'),
          axios.get('https://grokpmbackend_new.onrender.com/api/accounts'),
          axios.get('https://grokpmbackend_new.onrender.com/api/account-types'),
          axios.get('https://grokpmbackend_new.onrender.com/api/transactions'),
          axios.get('https://grokpmbackend_new.onrender.com/api/transaction-types'),
          axios.get('https://grokpmbackend_new.onrender.com/api/payments'),
        ]);
        setProperties(propRes.data);
        setUnits(unitRes.data);
        setTenants(tenantRes.data);
        setOwners(ownerRes.data);
        setAssociations(assocRes.data);
        setBoardMembers(boardRes.data);
        setAccounts(accRes.data);
        setAccountTypes(accTypeRes.data);
        setTransactions(transRes.data);
        setTransactionTypes(transTypeRes.data);
        setPayments(payRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      const url = `https://grokpmbackend_new.onrender.com/api/${endpoint.replace(/^transactions\//, '')}`;
      const response = await axios[method](url, data);
      if (endpoint.startsWith('properties')) setProperties([...properties, response.data]);
      if (endpoint.startsWith('units')) setUnits([...units, response.data]);
      if (endpoint.startsWith('tenants')) setTenants([...tenants, response.data]);
      if (endpoint.startsWith('owners')) setOwners([...owners, response.data]);
      if (endpoint.startsWith('associations')) setAssociations([...associations, response.data]);
      if (endpoint.startsWith('board-members')) setBoardMembers([...boardMembers, response.data]);
      if (endpoint.startsWith('accounts')) setAccounts([...accounts, response.data]);
      if (endpoint.startsWith('account-types')) setAccountTypes([...accountTypes, response.data]);
      if (endpoint.startsWith('transactions')) setTransactions([...transactions, response.data]);
      if (endpoint.startsWith('transaction-types')) setTransactionTypes([...transactionTypes, response.data]);
      if (endpoint.startsWith('payments')) setPayments([...payments, response.data]);
      return response.data;
    } catch (error) {
      console.error(`Error updating ${endpoint}:`, error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      state: { properties, units, tenants, owners, associations, boardMembers, accounts, accountTypes, transactions, transactionTypes, payments, searchQuery, loading },
      setSearchQuery,
      updateData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;