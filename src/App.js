import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import DatabaseConnection from './screens/DatabaseConnection';
import CollectionSelection from './screens/CollectionSelection';
import ApiConfiguration from './screens/ApiConfiguration';
import TestExecution from './screens/TestExecution';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <DatabaseConnection setIsConnected={setIsConnected} />
        </Route>
        <Route path="/select-collection">
          <CollectionSelection setSelectedCollection={setSelectedCollection} />
        </Route>
        <Route path="/configure-api">
          <ApiConfiguration 
            selectedCollection={selectedCollection} 
            setApiConfig={setApiConfig} 
          />
        </Route>
        <Route path="/execute-test">
          <TestExecution apiConfig={apiConfig} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;