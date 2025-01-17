import React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Button, Typography, Stack, Badge } from '@mui/material';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import { ThemeProvider } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import sideBarTheme from './Theme';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

/* 
  This already uses theme so should be easy to change the colour with the theme component.
*/

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: '0px',
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer(props) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  var currentTime = new Date().getHours();
  var greeting = "morning";
  if (currentTime > 12 )
    greeting = "afternoon";
  if (currentTime > 17 || currentTime < 5 )
    greeting = "evening";
  if (localStorage.getItem("first_name").length < 15)
    greeting += ", " + localStorage.getItem("first_name");

  return (
    <ThemeProvider  theme={sideBarTheme}>
    <Box sx={{ display: 'flex'}} >
      <CssBaseline />
      <AppBar position="fixed" open={open} color="primary">
        <Toolbar sx={{maxWidth: '100vw'}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: '36px',
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
        <Stack sx={{flexDirection: 'row', justifyContent: 'right', position: 'absolute', right: '0px', height: '100%', p: '0'}}>
          <Typography sx={{p: 2, height: '100%', fontSize: {xs: 0, sm: 0, md: 20, lg: 20, xl: 24}}} variant="h5">Good {greeting}</Typography>
          {localStorage.getItem('isAdmin') === 'true' && !open && <Button>
            <span className={"SidePageButton"} id={"Admin Panel"}><Stack sx={{flexDirection: 'row', justifyContent: 'center'}}>
              <SupervisorAccountIcon fontSize="large" color="tertiary"/></Stack>
            </span>
          </Button>}
          {!open && <Button>
            <span className="SidePageButton" id="Alerts">
              <Stack sx={{flexDirection: 'row', justifyContent: 'center'}}>
                <Badge badgeContent={(props.getAlerts === undefined ? 0 : (props.getAlerts).length)} color='error'>
                  <NotificationsIcon fontSize="large" color='tertiary'/>
                </Badge>
              </Stack>
            </span>
          </Button>}
        </Stack>
      </AppBar>
      <Drawer variant="permanent" open={open} id="sideBar">
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {['Dashboard', 'Profile', 'Workshops'].map((text, index) => (
            <ListItem button key={text} id={text} onClick={handleDrawerClose} sx={{color: '#000078', pt: '2.5vh', pb: '2.5vh'}}>
              <ListItemIcon>
                {index === 0 ? <DashboardIcon color="secondary"/> : (index === 1 ? <PersonIcon color="secondary"/> : <SchoolIcon color="secondary"/>)}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Stack spacing={0.5} sx={{position: 'absolute', bottom: '0', width: '100%'}}>
          
        <Button sx={{width: '100%', height: '10vh', p: '0'}}>
          <span className={"SidePageButton"} id={"System Settings"} style={{width: '100%'}}>
            <SettingsIcon color="secondary"/>
            {open && <Typography>Settings</Typography>}
          </span>
        </Button>
        <Button onClick={() => {props.setToken(false); window.location.reload(); localStorage.clear()}} sx={{width: '100%', height: '10vh'}}>
          <LogoutIcon color="secondary"/>
          {open && <Typography>Logout</Typography>}
        </Button>
        </Stack>
      </Drawer>
    </Box>
    </ThemeProvider>
  );
}
