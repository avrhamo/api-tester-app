import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress, 
  Alert,
  Grid,
  Paper
} from '@mui/material';
import { listDatabases, listCollections } from '../services/databaseService';

function CollectionSelection({ setSelectedCollection }) {
  const [databases, setDatabases] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const dbList = await listDatabases();
      setDatabases(dbList);
      setError('');
    } catch (err) {
      setError('Failed to fetch databases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = async (dbName) => {
    setSelectedDatabase(dbName);
    try {
      setLoading(true);
      const collectionList = await listCollections(dbName);
      setCollections(collectionList);
      setError('');
    } catch (err) {
      setError('Failed to fetch collections: ' + err.message);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionSelect = (collection) => {
    setSelectedCollection({ database: selectedDatabase, collection });
    history.push('/configure-api');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 8, px: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Select a Database and Collection
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Databases</Typography>
            <List>
              {databases.map((db) => (
                <ListItem
                  button
                  key={db}
                  onClick={() => handleDatabaseSelect(db)}
                  selected={selectedDatabase === db}
                >
                  <ListItemText primary={db} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Collections</Typography>
            {selectedDatabase ? (
              <List>
                {collections.map((collection) => (
                  <ListItem
                    button
                    key={collection}
                    onClick={() => handleCollectionSelect(collection)}
                  >
                    <ListItemText primary={collection} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">Please select a database first</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CollectionSelection;