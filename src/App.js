import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DatabaseConnection from './screens/DatabaseConnection';
import CollectionSelection from './screens/CollectionSelection';
import ApiConfiguration from './screens/ApiConfiguration';
import TestExecution from './screens/TestExecution';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  const [mode, setMode] = useState('dark');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <Header colorMode={colorMode} />
          <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
            <Sidebar isConnected={isConnected} />
            <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
              <Switch>
                <Route exact path="/">
                  <DatabaseConnection setIsConnected={setIsConnected} />
                </Route>
                <Route path="/select-collection">
                  {isConnected ? (
                    <CollectionSelection setSelectedCollection={setSelectedCollection} />
                  ) : (
                    <Redirect to="/" />
                  )}
                </Route>
                <Route path="/configure-api">
                  {selectedCollection ? (
                    <ApiConfiguration selectedCollection={selectedCollection} setApiConfig={setApiConfig} />
                  ) : (
                    <Redirect to="/select-collection" />
                  )}
                </Route>
                <Route path="/execute-test">
                  {apiConfig ? (
                    <TestExecution apiConfig={apiConfig} />
                  ) : (
                    <Redirect to="/configure-api" />
                  )}
                </Route>
              </Switch>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;