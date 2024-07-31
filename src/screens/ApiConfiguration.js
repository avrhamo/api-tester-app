import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { parseCurlCommand } from '../utils/curlParser';
import { getCollectionFields } from '../services/databaseService';

function ApiConfiguration({ selectedCollection, setApiConfig }) {
  const [curlCommand, setCurlCommand] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({
    urlParams: {},
    headers: {},
    body: {},
  });
  const [collectionFields, setCollectionFields] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();


  useEffect(() => {
    const fetchFields = async () => {
      if (selectedCollection && selectedCollection.database && selectedCollection.collection) {
        console.log('Fetching fields for:', selectedCollection);
        try {
          const fields = await getCollectionFields(selectedCollection.database, selectedCollection.collection);
          console.log('Fetched fields:', fields);
          setCollectionFields(fields);
        } catch (error) {
          console.error('Error fetching collection fields:', error);
          // Handle error (e.g., show an error message to the user)
        }
      }
    };
    fetchFields();
  }, [selectedCollection]);


  const fetchCollectionFields = async () => {
    setIsLoading(true);
    setError('');
    try {
      const fields = await getCollectionFields(selectedCollection.database, selectedCollection.collection);
      setCollectionFields(fields);
    } catch (err) {
      setError('Failed to fetch collection fields: ' + err.message);
      console.error('Error fetching collection fields:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
      } else {
        acc[`${pre}${k}`] = obj[k];
      }
      return acc;
    }, {});
  };

  const handleParseCurl = () => {
    console.log('Parsing curl command:', curlCommand);
    const parsed = parseCurlCommand(curlCommand);
    console.log('Parsed curl command:', parsed);

    const updatedParsed = { ...parsed, urlParams: parsed.queryParams || {} };
    console.log('Updated parsed command with URL params:', updatedParsed);
    setParsedCommand(updatedParsed);
    
    // Initialize field mappings
    const initialMappings = {
      urlParams: {},
      headers: {},
      body: {},
    };
    Object.keys(updatedParsed.urlParams).forEach(key => {
      initialMappings.urlParams[key] = '';
    });
    Object.keys(parsed.headers || {}).forEach(key => {
      initialMappings.headers[key] = '';
    });
    if (typeof parsed.data === 'object' && parsed.data !== null) {
      const flattenedBody = flattenObject(parsed.data);
      Object.keys(flattenedBody).forEach(key => {
        initialMappings.body[key] = '';
      });
    }
    
    console.log('Initial field mappings:', initialMappings);
    setFieldMappings(initialMappings);

    // Set debug info
    setDebugInfo(JSON.stringify({ parsed: updatedParsed, mappings: initialMappings }, null, 2));
  };

  const handleFieldMappingChange = (section, curlField, collectionField) => {
    setFieldMappings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [curlField]: collectionField
      }
    }));
  };



  const handleSubmit = () => {
    const config = {
      ...parsedCommand,
      fieldMappings,
      selectedCollection
    };
    setApiConfig(config);
    history.push('/execute-test');
  };

  const renderMappingTable = (section) => {
    const sectionData = fieldMappings[section] || {};
    console.log(`Rendering mapping table for ${section}:`, sectionData);
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Curl Field</TableCell>
              <TableCell>Collection Field</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sectionData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>No {section} found</TableCell>
              </TableRow>
            ) : (
              Object.entries(sectionData).map(([curlField, mappedField]) => (
                <TableRow key={curlField}>
                  <TableCell>{curlField}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Collection Field</InputLabel>
                      <Select
                        value={mappedField}
                        onChange={(e) => handleFieldMappingChange(section, curlField, e.target.value)}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {collectionFields.map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 8, px: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 8, px: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        API Configuration
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          label="Enter curl command"
          value={curlCommand}
          onChange={(e) => setCurlCommand(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleParseCurl}
          sx={{ mt: 2 }}
        >
          Parse curl command
        </Button>
      </Paper>

      {parsedCommand && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Parsed Command
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Method: {parsedCommand.method}</Typography>
              <Typography variant="subtitle1">URL: {parsedCommand.url}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Headers:</Typography>
              <pre>{JSON.stringify(parsedCommand.headers, null, 2)}</pre>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Field Mappings
          </Typography>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="URL Parameters" />
            <Tab label="Headers" />
            <Tab label="Body" />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && renderMappingTable('urlParams')}
            {activeTab === 1 && renderMappingTable('headers')}
            {activeTab === 2 && renderMappingTable('body')}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Configure API
          </Button>
        </Paper>
      )}

      {debugInfo && (
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Debug Information
          </Typography>
          <pre>{debugInfo}</pre>
        </Paper>
      )}
    </Box>
  );
}

export default ApiConfiguration;