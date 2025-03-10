import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

const AppContext = createContext();

const initialState = {
  properties: [],
  units: [],
  tenants: [],
  owners: [],
  boardMembers: [],
  associations: [],
  leases: [],
  addresses: [],
  searchQuery: '',
  loading: false,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_PROPERTIES':
      return { ...state, properties: action.payload };
    case 'ADD_PROPERTY':
      return { ...state, properties: [...state.properties, action.payload] };
    case 'UPDATE_PROPERTY':
      return { 
        ...state, 
        properties: state.properties.map(p => 
          p.id === action.payload.id ? action.payload : p
        ) 
      };
    case 'REMOVE_PROPERTY':
      return { 
        ...state, 
        properties: state.properties.filter(p => p.id !== action.payload) 
      };
    case 'SET_ADDRESSES':
      return { ...state, addresses: action.payload };
    case 'SET_UNITS':
      return { ...state, units: action.payload };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async (endpoint) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const url = `${API_ENDPOINT}/${endpoint}`;
      console.log(`Making GET request to: ${url}`);
      const response = await axios.get(url);
      console.log(`Response from GET ${endpoint}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Provide more specific error messages based on the error type
      let errorMessage = error.message;
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server.';
        console.log('Error fetching data from:', endpoint);
      } else if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'The server encountered an error.';
        } else if (error.response.status === 404) {
          errorMessage = `Resource not found: ${endpoint}`;
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Return empty data of the appropriate type based on the endpoint
      if (endpoint.includes('properties')) {
        return endpoint.includes('/') ? null : []; // Single property vs list
      } else if (endpoint.includes('units')) {
        return endpoint.includes('/') ? null : [];
      } else if (endpoint.includes('tenants')) {
        return endpoint.includes('/') ? null : [];
      }
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const modifyData = async (method, endpoint, data = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const url = `${API_ENDPOINT}/${endpoint}`;
      console.log(`Making ${method.toUpperCase()} request to: ${url}`, data);
      let response;

      const upperCaseMethod = method.toUpperCase();
      switch (upperCaseMethod) {
        case 'PUT':
          response = await axios.put(url, data);
          break;
        case 'DELETE':
          response = await axios.delete(url);
          break;
        case 'POST':
          response = await axios.post(url, data);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      console.log(`Response from ${upperCaseMethod} ${endpoint}:`, response.data);
      return response.data || true;
    } catch (error) {
      console.error('Error modifying data:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Provide more specific error messages based on the error type
      let errorMessage = error.message;
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server.';
        console.log('Error modifying data from:', method, endpoint);
      } else if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'The server encountered an error.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data submitted. Please check your inputs and try again.';
        } else if (error.response.status === 404) {
          errorMessage = `Resource not found: ${endpoint}`;
        }
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  // Helper functions for property-related data
  const getPropertyAddresses = (property) => {
    if (!property || !property.addresses) {
      return [];
    }
    return property.addresses || [];
  };

  const getUnitsForAddress = (addressId) => {
    if (!addressId || !state.units) {
      return [];
    }
    return state.units.filter(unit => unit.address_id === addressId) || [];
  };

  const value = {
    state,
    dispatch,
    fetchData,
    modifyData,
    setSearchQuery,
    getPropertyAddresses,
    getUnitsForAddress
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;