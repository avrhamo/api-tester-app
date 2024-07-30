import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import StorageIcon from '@mui/icons-material/Storage';
import ListIcon from '@mui/icons-material/List';
import SettingsIcon from '@mui/icons-material/Settings';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function Sidebar({ isConnected }) {
  const menuItems = [
    { text: 'Connect Database', icon: <StorageIcon />, path: '/' },
    { text: 'Select Collection', icon: <ListIcon />, path: '/select-collection', disabled: !isConnected },
    { text: 'Configure API', icon: <SettingsIcon />, path: '/configure-api', disabled: !isConnected },
    { text: 'Execute Test', icon: <PlayArrowIcon />, path: '/execute-test', disabled: !isConnected },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            disabled={item.disabled}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;