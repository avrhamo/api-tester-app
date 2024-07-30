import React, { useState } from 'react';
import { Button, Typography, Box, LinearProgress } from '@mui/material';

function TestExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartTest = () => {
    setIsRunning(true);
    // Mock test execution
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10;
        if (newProgress === 100) {
          clearInterval(interval);
          setIsRunning(false);
        }
        return newProgress;
      });
    }, 1000);
  };

  return (
    <Box sx={{ mt: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Execute Test
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleStartTest}
        disabled={isRunning}
      >
        Start Test
      </Button>
      {isRunning && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
    </Box>
  );
}

export default TestExecution;