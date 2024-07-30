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
} from '@mui/material';
import { parseCurlCommand } from '../utils/curlParser';

function ApiConfiguration({ selectedCollection, setApiConfig }) {
  const [curlCommand, setCurlCommand] = useState('');
  const [parsedCommand, setParsedCommand] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({});
  const [collectionFields, setCollectionFields] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // TODO: Fetch collection fields
    // This is a placeholder. Replace with actual field names from your collection.
    setCollectionFields(['field1', 'field2', 'field3']);
  }, [selectedCollection]);

  const handleParseCurl = () => {
    const parsed = parseCurlCommand(curlCommand);
    setParsedCommand(parsed);
    // Initialize field mappings
    const initialMappings = {};
    Object.keys(parsed.data || {}).forEach(key => {
      initialMappings[key] = '';
    });
    setFieldMappings(initialMappings);
  };

  const handleFieldMappingChange = (curlField, collectionField) => {
    setFieldMappings(prev => ({
      ...prev,
      [curlField]: collectionField
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
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Curl Field</TableCell>
                  <TableCell>Collection Field</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(fieldMappings).map((curlField) => (
                  <TableRow key={curlField}>
                    <TableCell>{curlField}</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel>Collection Field</InputLabel>
                        <Select
                          value={fieldMappings[curlField]}
                          onChange={(e) => handleFieldMappingChange(curlField, e.target.value)}
                        >
                          {collectionFields.map((field) => (
                            <MenuItem key={field} value={field}>
                              {field}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
    </Box>
  );
}

export default ApiConfiguration;