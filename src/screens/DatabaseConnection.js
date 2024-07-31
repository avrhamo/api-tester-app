import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { TextField, Button, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { connectToDatabase } from '../services/databaseService';

function DatabaseConnection({ setIsConnected }) {
  const [connectionString, setConnectionString] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    setError('');
    try {
      await connectToDatabase(connectionString);
      setIsConnected(true);
      history.push('/select-collection');
    } catch (err) {
      setError('Failed to connect to database. Please check your connection string.');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  }, [connectionString, history, setIsConnected]);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const safeSetter = (setter) => (...args) => {
    if (isMounted) {
      setter(...args);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Connect to MongoDB
      </Typography>
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <TextField
          fullWidth
          label="Connection String"
          variant="outlined"
          value={connectionString}
          onChange={(e) => setConnectionString(e.target.value)}
          margin="normal"
        />
        <Button
          fullWidth
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