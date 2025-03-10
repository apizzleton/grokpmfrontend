import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { API_ENDPOINT } from '../config/api';

const AppContext = createContext();

const initialState = {
  properties: [],
  units: [],
  tenants: [],
  owners: [],
  boardMembers: [],
  associations: [],
  leases: [],
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
    default:
      return state;
  }
};

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchData = async (endpoint) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`${API_ENDPOINT}/${endpoint}`, {
        withCredentials: false,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const modifyData = async (method, endpoint, data = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const url = `${API_ENDPOINT}/${endpoint}`;
      let response;

      const config = {
        withCredentials: false,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      };

      switch (method.toUpperCase()) {
        case 'PUT':
          response = await axios.put(url, data, config);
          break;
        case 'DELETE':
          response = await axios.delete(url, config);
          break;
        case 'POST':
          response = await axios.post(url, data, config);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return true;
    } catch (error) {
      console.error('Error modifying data:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSearchQuery = (query) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const value = {
    state,
    dispatch,
    fetchData,
    modifyData,
    setSearchQuery
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