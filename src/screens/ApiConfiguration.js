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
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
  Modal
} from '@mui/material';
import { parseCurlCommand } from '../utils/curlParser';
import { getCollectionFields } from '../services/databaseService';
import { decodeBase64 } from '../utils/base64Utils';
import CloseIcon from '@mui/icons-material/Close';
import { jwtDecode } from 'jwt-decode';

function ApiConfiguration({ selectedCollection, setApiConfig }) {
  const [curlCommand, setCurlCommand] = useState('');
  const [filterText, setFilterText] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({
    urlParams: {}, headers: {}, body: {}
  });
  const [useFixedValue, setUseFixedValue] = useState({
    urlParams: {}, headers: {}, body: {}
  });
  const [collectionFields, setCollectionFields] = useState([]);
  const [encodedFieldModalOpen, setEncodedFieldModalOpen] = useState(false);
  const [decodedFields, setDecodedFields] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();
  const [specialFieldModalOpen, setSpecialFieldModalOpen] = useState(false);
  const [specialFieldType, setSpecialFieldType] = useState('encoded');
  const [oauthData, setOauthData] = useState({ accessTokenUrl: '', clientId: '', clientSecret: '' });
  const [jwtToken, setJwtToken] = useState('');

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const handleDecodeBase64 = (base64String) => {
    try {
      // Basic validation for base64 string
      if (!base64String || typeof base64String !== 'string' || base64String.trim() === '') {
        alert('Please enter a valid Base64 encoded string.');
        return;
      }

      // Decode the base64 string
      const decodedString = atob(base64String); // `atob` decodes a base64-encoded string

      // Try parsing the decoded string as JSON
      const decodedObject = JSON.parse(decodedString);
      console.log('Decoded Base64 JSON:', decodedObject);

      // Extract fields from the decoded JSON object
      const extractedFields = Object.entries(decodedObject).reduce((acc, [key, value]) => {
        acc[key] = { collectionField: '', fixedValue: value }; // Initialize mapping fields
        return acc;
      }, {});

      setDecodedFields(extractedFields);  // Set the decoded fields state for further mapping

    } catch (error) {
      console.error('Failed to decode Base64:', error);
      alert('Invalid Base64 string or JSON format. Please check the input and try again.');
    }
  };

  const handleOauthSubmit = async () => {
    const { accessTokenUrl, clientId, clientSecret } = oauthData;

    if (!accessTokenUrl || !clientId || !clientSecret) {
      alert('Please fill in all OAuth fields.');
      return;
    }

    try {
      const response = await fetch(accessTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access token.');
      }

      const data = await response.json();
      console.log('OAuth Token Response:', data);

      if (data.access_token) {
        alert(`Access token retrieved: ${data.access_token}`);
      } else {
        alert('Failed to retrieve access token. Please check the credentials.');
      }
    } catch (error) {
      console.error('Error fetching OAuth token:', error);
      alert('Error fetching OAuth token. Please check the console for more details.');
    }
  };

  const handleJwtDecode = () => {
    try {
      if (!jwtToken) {
        alert('Please enter a JWT token.');
        return;
      }

      // Decode the JWT token
      const decoded = jwtDecode(jwtToken);
      console.log('Decoded JWT:', decoded);

      // Extract fields from the JWT payload for mapping
      const decodedFields = Object.entries(decoded).reduce((acc, [key, value]) => {
        acc[key] = { collectionField: '', fixedValue: value }; // Initialize mapping fields
        return acc;
      }, {});

      setDecodedFields(decodedFields);  // Set the decoded fields state
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      alert('Invalid JWT token. Please check the input and try again.');
    }
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
          console.log('Fetched Fields:', fields);

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

  const handleSpecialFieldClick = () => {
    setSpecialFieldModalOpen(true);
  };

  const handleRadioChange = (event) => {
    setSpecialFieldType(event.target.value);
  };

  const handleCloseModal = () => {
    setSpecialFieldModalOpen(false);
    setSpecialFieldType('encoded'); // Reset to default when modal closes
    setOauthData({ accessTokenUrl: '', clientId: '', clientSecret: '' });
    setJwtToken('');
  };

  const handleParseCurl = () => {
    try {
      const parsed = parseCurlCommand(curlCommand);
      console.log('Parsed curl command:', parsed);
      setParsedCommand(parsed);

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

      const autoMatch = (key) => {
        return collectionFields.find(field => field.toLowerCase() === key.toLowerCase()) || '';
      };

      if (parsed.queryParams) {
        Object.keys(parsed.queryParams).forEach(key => {
          initialMappings.urlParams[key] = { collectionField: autoMatch(key), fixedValue: parsed.queryParams[key] };
          initialUseFixedValue.urlParams[key] = false;
        });
      }

      if (parsed.headers) {
        Object.keys(parsed.headers).forEach(key => {
          initialMappings.headers[key] = { collectionField: autoMatch(key), fixedValue: parsed.headers[key] };
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
              acc[`${pre}${k}`] = { collectionField: autoMatch(k), fixedValue: obj[k] };
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
              <TableCell>Special Field</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.keys(sectionData).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No {section} found</TableCell>
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
                          {filteredFields.map((field, index) => (
                            <MenuItem key={`${field}-${index}`} value={field}>
                              {field}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSpecialFieldClick}
                    >
                      Special Field
                    </Button>
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
          rows={10}
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
      <Modal open={specialFieldModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',  // Set modal width to 50% of the window
            maxHeight: '80%',  // Optional: constrain height
            overflowY: 'auto',  // Enable scrolling if content exceeds height
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1,
            boxShadow: 24,
            p: 4,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" component="h2" gutterBottom>
            Select Special Field Type
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup value={specialFieldType} onChange={handleRadioChange}>
              <FormControlLabel value="encoded" control={<Radio />} label="Encoded Field" />
              <FormControlLabel value="oauth" control={<Radio />} label="OAuth Handling" />
              <FormControlLabel value="jwt" control={<Radio />} label="JWT Handling" />
            </RadioGroup>
          </FormControl>

          {specialFieldType === 'encoded' && (
            <div>
              <TextField
                fullWidth
                multiline
                rows={3}  // Increase rows for larger input space
                placeholder="Enter Base64 encoded data"
                onChange={(e) => handleDecodeBase64(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              {Object.entries(decodedFields).map(([key, value]) => (
                <Grid container spacing={2} key={key} alignItems="center" justifyContent="space-between">
                  <Grid item xs={6}>
                    <Typography>{key}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id={`${key}-label`}>Map to Field</InputLabel>
                      <Select
                        labelId={`${key}-label`}
                        value={fieldMappings.headers[key] || ''}
                        onChange={(e) =>
                          setFieldMappings({
                            ...fieldMappings,
                            headers: {
                              ...fieldMappings.headers,
                              [key]: e.target.value,
                            },
                          })
                        }
                        label="Map to Field"
                      >
                        {collectionFields.map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              ))}
            </div>
          )}

          {specialFieldType === 'oauth' && (
            <div>
              <TextField
                fullWidth
                placeholder="Access Token URL"
                value={oauthData.accessTokenUrl}
                onChange={(e) => setOauthData({ ...oauthData, accessTokenUrl: e.target.value })}
                sx={{ marginBottom: 2 }}  // Add margin to create space between fields
              />
              <TextField
                fullWidth
                placeholder="Client ID"
                value={oauthData.clientId}
                onChange={(e) => setOauthData({ ...oauthData, clientId: e.target.value })}
                sx={{ marginBottom: 2 }}  // Add margin to create space between fields
              />
              <TextField
                fullWidth
                placeholder="Client Secret"
                value={oauthData.clientSecret}
                onChange={(e) => setOauthData({ ...oauthData, clientSecret: e.target.value })}
                sx={{ marginBottom: 2 }}  // Add margin to create space between fields
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleOauthSubmit}
                sx={{ bgcolor: '#51ed75', '&:hover': { bgcolor:  '#aeebbc' }, marginBottom: 2 }}>
                Submit
              </Button>
            </div>
          )}

          {specialFieldType === 'jwt' && (
            <div>
              <TextField
                fullWidth
                multiline
                rows={5}
                placeholder="Enter JWT token"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button
                variant="contained"
                sx={{ bgcolor: '#51ed75', '&:hover': { bgcolor:  '#aeebbc' }, marginBottom: 2 }}
                onClick={handleJwtDecode}>
                Decode JWT
              </Button>
            </div>
          )}

          {/* <Button variant="contained"
            sx={{ display: 'flex', bgcolor: '#eb4266', '&:hover': { bgcolor: '#e88298' } }} // Custom color for Close button
            onClick={handleCloseModal}
          >
            Close
          </Button> */}
        </Box>
      </Modal>
    </Box>
  );
}

export default ApiConfiguration;
