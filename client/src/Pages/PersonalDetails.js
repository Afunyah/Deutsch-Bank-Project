import React from 'react';
import {  useState, useEffect } from 'react';
import { Switch, Box, Typography, Grid, Stack, Container, TextField, IconButton, Autocomplete, CircularProgress } from '@mui/material';
import { withStyles } from "@mui/styles";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '../Components/Button';
import { ThemeProvider } from '@emotion/react';
import Theme  from '../Components/Theme';
import TagSelector from '../Components/TagSelector';
import TagSelectorToBinaryArray from '../Utility/TagSelectorToBinaryArray';
const key = require('../api-key.json')



const CustomSwitch = withStyles({
    switchBase: {
        color: "grey",
        "&$checked": {
            color: "#5743DB",
            opacity: 1
        },
        "&$checked + $track": {
            backgroundColor: "#5743DB",
            opacity: 0.5
        },
    },
    checked: {},
    track: {}
})(Switch);


const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);


async function updateUser(userInfo) {
    var userID = localStorage.getItem('user_id');
    console.log(userID)
    return fetch ('http://localhost:3001/api/user/' +userID, {
        method: 'PUT',
        credentials : 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo)
    })
        .then(data => data.json())   
}


async function deleteUser(userID) {
    fetch ('http://localhost:3001/api/user/' +userID, {
        method: 'DELETE',
        credentials : 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    //.then(data => data.json())   
}
function PersonalDetails(props) {
    const [submitted, setSubmitted] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [business, setBusiness] = useState("");
    const [mentor, setMentor] = useState(false);
    const [selected, setSelected] = useState([]);
    const [businessOpen, setBusinessOpen] = useState(false);
    const [businessOptions, setBusinessOptions] = useState([]);
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [user, setUser] = useState({})
    const [loadingUser, setLoadingUser] = useState(true);

    var userID = localStorage.getItem('user_id');


    function loadBusiness() {
        (async () => {
          const response = await fetch ('http://localhost:3001/api/business', {
              method: 'GET',
              credentials : 'include',
              headers: {
                  'Content-Type': 'application/json',
                  "api-key": key['key']
              }
          })
          const businesses = await response.json();
          setBusinessOptions(businesses);
          setLoadingBusiness(false);
        })();
    }
    function fetchData() {
        (async () => {
            const response = await fetch('http://localhost:3001/api/user/' + userID, {
            method: 'GET',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            })
            
            const userDB = await response.json();
            setUser(userDB);
            setFirstName(userDB.first_name);
            setLastName(userDB.last_name);
            setEmail(userDB.email);
            setPassword(userDB.password);
            setBusiness(userDB.business);
            setMentor(userDB.isMentor);
            setSelected(userDB.aoe);
            setLoadingUser(false);
        })();
    }


    useEffect(() => {
        if (loadingBusiness) {
            loadBusiness()
        }
        if (loadingUser) {
            fetchData();
        }
    }, [businessOpen, user]);



    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
        
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    function validateUpdate() {
        var emailRegex = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$');
        return email.length > 0 && first_name.length > 0 && last_name.length > 0 && emailRegex.test(email);
    }

    const handelDelete = async e => {
        await deleteUser(userID);
    }

    const handelUpdate = async e => {
        setSubmitted(true);

        const user = {
            "first_name" : first_name,
            "last_name" : last_name, 
            "email": email,
            //"password": password,
            "business" : business,
            "aoe": (mentor ? TagSelectorToBinaryArray(selected, false) : TagSelectorToBinaryArray([], false)),
            "isMentor":mentor
        }

        const result = await updateUser(user);

        if (result.acknowledged) {
            localStorage.setItem('first_name', user.first_name);
            localStorage.setItem('last_name', user.last_name);
            localStorage.setItem('email', user.email);
            //localStorage.setItem('password', user.password);
            localStorage.setItem('business', user.business);
            if (user.isMentor) {
                localStorage.setItem('isMentor', 'true');
            }
            else {
                localStorage.setItem('isMentor', 'false');
            }
        } else {
            alert("Oops looks like something went wrong");
        }
        
    }

        return (
            <ThemeProvider theme={Theme}>
            
            {(loadingUser || loadingBusiness) &&
                <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <StyleCircularProgress/>
                </Box>
            }
            
            {!submitted && !loadingBusiness && !loadingUser &&
                   
                    <Grid container spacing={0}>
                        <Grid item xs={2} />
                        <Grid item xs={8}>
                            <Container sx={{ height: 'auto', width: '100%', py: '5vh', alignContent: 'center' }}>
                                <Stack spacing={4} alignItems='center'>
                                    
                                    <Typography align="center" variant='h4'>Change your details:</Typography>
                                    <TextField 
                                        id="first-name" 
                                        label="First name"
                                        value= {first_name}
                                        variant="outlined"
                                        onChange={e => setFirstName(e.target.value)} 
                                        required 
                                        sx={{minWidth: '210px' , width: '50%'}}
                                    />
                                    <TextField 
                                        id="last-name" 
                                        label='Last name' 
                                        value={last_name}
                                        variant="outlined" 
                                        onChange={e => setLastName(e.target.value)} 
                                        required 
                                        sx={{minWidth: '210px' , width: '50%'}}
                                    />

                                    <TextField
                                        id="new-email"
                                        label="Email"
                                        value={email}
                                        type="email"
                                        variant="outlined"
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        sx={{ minWidth: '210px', width: '50%' }} />
                                    
                                    <TextField 
                                        helperText="Minimum eight characters, at least one letter, one number and one special character"
                                        id="new-password" 
                                        label="Password" 
                                        type={showPassword ? 'text' : 'password'} 
                                        value={password}
                                        disabled
                                        variant="outlined" 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        sx={{minWidth: '210px' , width: '50%'}}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={handleClickShowPassword}
                                                        onMouseDown={handleMouseDownPassword}
                                                        edge="end"
                                                        >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                     <Autocomplete 
                                        onOpen={() => {setBusinessOpen(true)}} 
                                        onClose={() => {setBusinessOpen(false)}} 
                                        id="business" options={businessOptions} 
                                        defaultValue =  {businessOptions.find((elem)=>{return elem.Name === business})}
                                        loading={loadingBusiness}
                                        sx={{minWidth: '210px' , width: '50%'}} 
                                        onChange={(e ,option) => {setBusiness(option.Name)}} 
                                        getOptionLabel={(option) => option.Name} 
                                        renderInput={(params) => <TextField {...params} label="Business Area" required/>}
                                    />
                                    <Typography variant="h6" align='center'>Would you like to be a mentor?</Typography>
                                    <CustomSwitch checked={mentor} onChange={() => {setMentor(!mentor)}}/>
                                    {mentor && 
                                        <>
                                        <Typography variant="h6" align='center'>Select your areas of expertise</Typography>
                                        <Box 
                                            sx={{minWidth: '210px' , width: '50%'}}>
                                            <TagSelector stateFunction={(tagArray) => {setSelected(tagArray)}} startingTags={selected}/>
                                        </Box>
                                        </>
                                    }
                                    
                                    <Button 
                                        onClick= {() => {handelUpdate()}} 
                                        disabled={!validateUpdate()}
                                        text="Update Personal Details"
                                    />
                                    
                                    <Button 
                                        text="Delete Account" 
                                        onClick={() => {handelDelete(); window.location.reload(); localStorage.clear()}} 
                                        sx={{width: '100%', height: '10vh'}}>
                                    </Button>
                                </Stack>
                            </Container>
                        </Grid>
                    </Grid>
            }
            {submitted && 
               
                    <Stack spacing={4} alignItems='center' sx={{pt: '3vh'}}>
                        <Typography variant='h5'>Your personal details have been updated.</Typography>
                        <Button onClick={() => {setSubmitted(false)}} text={"View personal details"}></Button>
                    </Stack>
            }
            </ThemeProvider>
        );
    }
    
export default PersonalDetails;
