import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress, Alert, MenuItem, Select } from '@mui/material';
import { connectToDatabase } from '../services/databaseService';

function DatabaseConnection({ setIsConnected }) {
  const [connectionString, setConnectionString] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connectionHistory, setConnectionHistory] = useState([]);  // State to store connection history
  const history = useHistory();

  // Function to handle connection
  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError('');
    try {
      await connectToDatabase(connectionString);
      setIsConnected(true);
      
      // Save the connection string to localStorage
      const updatedHistory = [...new Set([connectionString, ...connectionHistory])];  // Ensure no duplicates
      localStorage.setItem('connectionHistory', JSON.stringify(updatedHistory));
      setConnectionHistory(updatedHistory);

      history.push('/select-collection');
    } catch (err) {
      setError('Failed to connect to database. Please check your connection string.');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, [connectionString, history, setIsConnected, connectionHistory]);

  // Load connection history from localStorage on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('connectionHistory')) || [];
    setConnectionHistory(savedHistory);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Connect to MongoDB
      </Typography>
      <Box sx={{
        width: '100%',
        maxWidth: 800,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Dropdown to select from connection history */}
        <Select
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="" disabled>Select a previous connection</MenuItem>
          {connectionHistory.map((connStr, index) => (
            <MenuItem key={index} value={connStr}>
              {connStr}
            </MenuItem>
          ))}
        </Select>

        {/* TextField for manual input */}
        <TextField
          fullWidth
          label="Connection String"
          variant="outlined"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          margin="normal"
          multiline
          minRows={1}
          maxRows={4}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleConnect}
          disabled={isConnecting}
          sx={{ mt: 2 }}
        >
          {isConnecting ? <CircularProgress size={24} /> : 'Connect'}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
}

export default DatabaseConnection;
