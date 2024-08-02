import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import { executeApiTest } from '../services/apiService';

function TestExecution({ apiConfig }) {
  const [testParams, setTestParams] = useState({
    numRequests: 1,
    concurrency: 1,
  });
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setTestParams(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleExecuteTest = async () => {
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const testResults = await executeApiTest(apiConfig, testParams);
      setResults(testResults);
    } catch (err) {
      setError(`Error executing test: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Execute API Test
      </Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Parameters
        </Typography>
        <TextField
          name="numRequests"
          label="Number of Requests"
          type="number"
          value={testParams.numRequests}
          onChange={handleParamChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="concurrency"
          label="Concurrency"
          type="number"
          value={testParams.concurrency}
          onChange={handleParamChange}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleExecuteTest}
          disabled={isLoading}
          sx={{ mt: 2 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Execute Test'}
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Test Results
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Total Requests</TableCell>
                  <TableCell align="right">{results.totalRequests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Successful Requests</TableCell>
                  <TableCell align="right">{results.successfulRequests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Failed Requests</TableCell>
                  <TableCell align="right">{results.failedRequests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Average Response Time (ms)</TableCell>
                  <TableCell align="right">{results.avgResponseTime.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Min Response Time (ms)</TableCell>
                  <TableCell align="right">{results.minResponseTime}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max Response Time (ms)</TableCell>
                  <TableCell align="right">{results.maxResponseTime}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}

export default TestExecution;