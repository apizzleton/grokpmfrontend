import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://grokpmbackend-new.onrender.com/api',
  timeout: 10000, // 10-second timeout
});

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
        // First fetch properties separately to debug
        const propertiesResponse = await api.get('/properties');
        console.log('Properties response:', propertiesResponse.data);
        if (Array.isArray(propertiesResponse.data)) {
          setProperties(propertiesResponse.data);
        } else {
          console.error('Properties data is not an array:', propertiesResponse.data);
          setProperties([]);
        }

        const endpoints = [
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
          endpoints.map(endpoint => api.get(`/${endpoint}`).catch(error => {
            console.error(`Failed to fetch ${endpoint}:`, error.message);
            return { data: [] };
          }))
        );

        const setters = [
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

        responses.forEach((res, index) => {
          if (res.data && Array.isArray(res.data)) {
            setters[index](res.data);
          } else {
            console.error(`Invalid data format for ${endpoints[index]}:`, res.data);
            setters[index]([]);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateData = async (endpoint, data, method = 'post') => {
    try {
      const cleanEndpoint = endpoint.replace(/^transactions\//, '');
      let response;
      
      if (method === 'delete') {
        response = await api.delete(`/${cleanEndpoint}`);
        // Update local state by removing the deleted item
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

        const setter = stateMap[cleanEndpoint.split('/')[0]];
        if (setter) {
          const id = cleanEndpoint.split('/')[1];
          setter(prev => {
            console.log('Removing item with id:', id, 'from', cleanEndpoint.split('/')[0]);
            return prev.filter(item => item.id !== parseInt(id));
          });
        }
      } else {
        response = await api[method](`/${cleanEndpoint}`, data);
        console.log(`${method.toUpperCase()} response for ${cleanEndpoint}:`, response.data);
        
        // Update local state by adding/updating the item
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

        const setter = stateMap[cleanEndpoint.split('/')[0]];
        if (setter) {
          if (method === 'put') {
            setter(prev => {
              console.log('Updating item:', response.data);
              return prev.map(item => item.id === response.data.id ? response.data : item);
            });
          } else {
            setter(prev => {
              console.log('Adding new item:', response.data);
              return [...prev, response.data];
            });
          }
        }
      }

      return response.data;
    } catch (error) {
      console.error(`Error ${method} ${endpoint}:`, error.response?.data || error.message);
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

const AppContext = createContext();

export default AppContext;