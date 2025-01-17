import * as React from 'react';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <span
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0.5 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </span>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs(props) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  /* 
    
  */

  return (
    <Box sx={{ bgcolor: 'white', width: '100%', height: '100%', color: '#000078'}}>
      <AppBar position="sticky" sx={{backgroundColor: 'white', color: '#000078', boxShadow: 'none'}}>
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
          TabIndicatorProps={{style: {background: '#5743DB'}}}
        >
          {props.tabSubjects.map((tabSubject, index ) => {
            return <Tab label={tabSubject} key={index} {...a11yProps(index)} sx={{ fontSize: 34, textTransform: 'none'}}/>;
          })}
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        {props.tabObjects.map((tabObject, index ) => {
          return <TabPanel key={index} value={value} index={index} dir={theme.direction}>
          {tabObject}
          </TabPanel>;
        })}
      </SwipeableViews>
    </Box>
  );
}
