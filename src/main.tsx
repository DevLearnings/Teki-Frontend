// src/index.js or src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Ensure this line is present
import App from './App';
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

ReactDOM.render(
  <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</React.StrictMode>,
  document.getElementById('root')
);


