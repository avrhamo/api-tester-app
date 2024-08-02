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
  Switch,
  FormControlLabel
} from '@mui/material';
import { parseCurlCommand } from '../utils/curlParser';
import { getCollectionFields } from '../services/databaseService';

function ApiConfiguration({ selectedCollection, setApiConfig}) {
  const [curlCommand, setCurlCommand] = useState('');
  const [filterText, setFilterText] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({
    urlParams: {},
    headers: {},
    body: {},
  });
  const [useFixedValue, setUseFixedValue] = useState({
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

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const filteredFields = collectionFields.filter((field) =>
    field.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    const fetchFields = async () => {
      if (selectedCollection && selectedCollection.database && selectedCollection.collection) {
        setIsLoading(true);
        setError('');
        try {
          const fields = await getCollectionFields(selectedCollection.database, selectedCollection.collection);
          setCollectionFields(fields);
        } catch (err) {
          console.error('Error fetching collection fields:', err);
          setError(`Failed to fetch collection fields: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFields();
  }, [selectedCollection]);

  const handleParseCurl = () => {
    try {
      const parsed = parseCurlCommand(curlCommand);
      console.log('Parsed curl command:', parsed);
      setParsedCommand(parsed);
  
      // Initialize field mappings
      const initialMappings = {
        urlParams: {},
        headers: {},
        body: {},
      };

      const initialUseFixedValue = {
        urlParams: {},
        headers: {},
        body: {},
      };

      if (parsed.queryParams) {
        Object.keys(parsed.queryParams).forEach(key => {
          initialMappings.urlParams[key] = { collectionField: '' };
          initialUseFixedValue.urlParams[key] = false;
        });
      }
  
      if (parsed.headers) {
        Object.keys(parsed.headers).forEach(key => {
          initialMappings.headers[key] = { collectionField: '' };
          initialUseFixedValue.headers[key] = false;
        });
      }
  
      if (parsed.data && typeof parsed.data === 'object') {
        const flattenObject = (obj, prefix = '') => {
          return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? `${prefix}.` : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
              Object.assign(acc, flattenObject(obj[k], `${pre}${k}`));
            } else {
              acc[`${pre}${k}`] = { collectionField: '' };
            }
            return acc;
          }, {});
        };
  
        const flattenedBody = flattenObject(parsed.data);
        Object.assign(initialMappings.body, flattenedBody);
        Object.keys(flattenedBody).forEach(key => {
          initialUseFixedValue.body[key] = false;
        });
      }
  
      console.log('Initial field mappings:', initialMappings);
      setFieldMappings(initialMappings);
      setUseFixedValue(initialUseFixedValue);
      setDebugInfo(JSON.stringify({ parsed, mappings: initialMappings, useFixedValue: initialUseFixedValue }, null, 2));
    } catch (error) {
      console.error('Error parsing curl command:', error);
      setError('Failed to parse curl command: ' + error.message);
    }
  };

  const handleFieldMappingChange = (section, curlField, value, isFixedValue = false) => {
    setFieldMappings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [curlField]: isFixedValue ? { fixedValue: value } : { collectionField: value }
      }
    }));
  };

  const handleSubmit = () => {
    console.log('Field Mappings on Submit:', fieldMappings);

    const config = {
      ...parsedCommand,
      fieldMappings,
      selectedCollection
    };
    setApiConfig(config);
    history.push('/execute-test');
  };

  const handleUseFixedValueChange = (section, curlField) => {
    setUseFixedValue(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [curlField]: !prev[section][curlField]
      }
    }));

    handleFieldMappingChange(section, curlField, '', !useFixedValue[section][curlField]);
  };

const renderMappingTable = (section) => {
    const sectionData = fieldMappings[section] || {};
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Curl Field</TableCell>
              <TableCell>Use Fixed Value</TableCell>
              <TableCell>Collection Field / Fixed Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sectionData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>No {section} found</TableCell>
              </TableRow>
            ) : (
              Object.entries(sectionData).map(([curlField, mappedValue]) => (
                <TableRow key={curlField}>
                  <TableCell>{curlField}</TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useFixedValue[section][curlField] || false}
                          onChange={() => handleUseFixedValueChange(section, curlField)}
                        />
                      }
                      label="Fixed Value"
                    />
                  </TableCell>
                  <TableCell>
                    {useFixedValue[section][curlField] ? (
                      <TextField
                        fullWidth
                        value={mappedValue.fixedValue || ''}
                        onChange={(e) => handleFieldMappingChange(section, curlField, e.target.value, true)}
                        placeholder="Enter fixed value"
                      />
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel>Collection Field</InputLabel>
                        <Select
                          value={mappedValue.collectionField || ''}
                          onChange={(e) => handleFieldMappingChange(section, curlField, e.target.value)}
                          renderValue={(selected) => selected}
                        >
                          <MenuItem>
                            <TextField
                              placeholder="Filter..."
                              value={filterText}
                              onChange={handleFilterChange}
                              variant="outlined"
                              fullWidth
                              type='search'
                              onClick={(e) => e.stopPropagation()}
                            />
                          </MenuItem>
                          {filteredFields.map((field) => (
                            <MenuItem key={field} value={field}>
                              {field}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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