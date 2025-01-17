import React, {useState, useEffect} from 'react';
import { Container, Grid, Box, Typography, TextField, Stack, Slide, Fade, Autocomplete, Switch} from '@mui/material';
import Mentor from "../Resources/Mentor.jpg";
import { withStyles } from "@mui/styles";
import TagSelector from '../Components/TagSelector';
import Button from '../Components/Button';
import TagSelectorToBinaryArray from '../Utility/TagSelectorToBinaryArray';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import theme from '../Components/Theme';
import { ThemeProvider } from '@mui/material/styles';

const key = require('../api-key.json')

async function loginUser(credentials) {
    return fetch ('http://localhost:3001/api/auth/login', {
        method: 'POST',
        credentials : 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
    })
        .then(data => data.json())
}

async function registerUser(userInfo) {
    return fetch ('http://localhost:3001/api/auth/register', {
        method: 'POST',
        credentials : 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo)
    })
        .then(data => data.json())
}

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


export default function Login(props) {
    const [page, setPage] = useState(0);
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [business, setBusiness] = useState("");
    const [branch, setBranch] = useState("");
    const [mentor, setMentor] = useState(false);
    const [selected, setSelected] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const [businessOpen, setBusinessOpen] = useState(false);
    const [businessOptions, setBusinessOptions] = useState([]);
    const [loadingBusiness, setLoadingBusiness] = useState(true);
    const [branchOpen, setBranchOpen] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [loadingBranch, setLoadingBranch] = useState(true);

    function loadBusiness() {
        (async () => {
          const response = await fetch ('http://localhost:3001/api/business', {
            method: 'GET',
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

    function loadBranch() {
        (async () => {
          const response = await fetch ('http://localhost:3001/api/branches', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "api-key": key['key']
            }
          })
          const branches = await response.json();
          setBranchOptions(branches);
          setLoadingBranch(false);
        })();
    }

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    useEffect(() => {
        if (loadingBusiness) {
            loadBusiness()
        }
        if (loadingBranch) {
            loadBranch()
        }
    }, [businessOpen, branchOpen]);

    useEffect(() => {
        window.addEventListener("resize", sizeChange);
    }, [width, height])

    function validateForm() {
        return email.length > 0 && password.length > 0;
    }
    
    function validateRegistration() {
        var emailRegex = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$');
        var passwordRegex = new RegExp("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,32}$"); 
        //Minimum eight characters, at least one letter, one number and one special character
        return business.length > 0 && branch.length > 0 && newEmail.length > 0 && first_name.length > 0 && last_name.length > 0 && passwordRegex.test(newPassword) && emailRegex.test(newEmail);
    }

    

    const handleLogin = async e => {
        const token = await loginUser ({
            username : email,
            password : password
        });

        if (token.result === 1) {
            let userObject = token.user
            let watchlistObject = JSON.stringify(token.watchlist)
            localStorage.setItem('user_id', userObject._id);
            localStorage.setItem('first_name', userObject.first_name);
            localStorage.setItem('last_name', userObject.last_name);
            localStorage.setItem('email', userObject.email);
            localStorage.setItem('password', userObject.password);
            localStorage.setItem('business', userObject.business);
            localStorage.setItem('mentorId', token.mentorsAndTees.mentorId);
            localStorage.setItem('mentorStatus', token.mentorsAndTees.mentorStatus);
            localStorage.setItem('mentees', JSON.stringify(token.mentorsAndTees.menteeArray));
            localStorage.setItem('branch', userObject.branch);
            if (userObject.isMentor) {
                localStorage.setItem('isMentor', 'true');
            }
            else {
                localStorage.setItem('isMentor', 'false');
            }
            if (userObject.isAdmin) {
                localStorage.setItem('isAdmin', 'true');
            }
            else {
                localStorage.setItem('isAdmin', 'false');
            }
            localStorage.setItem('watchlist', watchlistObject);
            props.setToken(true)
            localStorage.setItem('token', 'true');
        } else {
            alert(token.message);
        }
    }

    const handleRegister = async e => {
        if (!mentor){
            setSelected([]);
        }
        const token = await registerUser ({
            "email": newEmail,
            "password": newPassword,
            "first_name" : first_name,
            "last_name" : last_name, 
            "business" : business,
            "isMentor" : mentor,
            "aoe": (mentor ? TagSelectorToBinaryArray(selected, false) : TagSelectorToBinaryArray([], false)),
            "branch": branch
        });
        if (token.result === 1) {
            localStorage.setItem('token', 'true');
            let userObject = token.user
            localStorage.setItem('user_id', userObject._id);
            localStorage.setItem('first_name', userObject.first_name);
            localStorage.setItem('business', userObject.business);
            localStorage.setItem('branch', userObject.branch);
            localStorage.setItem('mentorId', null);
            localStorage.setItem('mentorStatus', null);
            localStorage.setItem('mentees', '[]');
            localStorage.setItem('jwtToken', null)
            if (userObject.isMentor) {
                localStorage.setItem('isMentor', 'true');
            }
            else {
                localStorage.setItem('isMentor', 'false');
            }
            localStorage.setItem('watchlist', '[]');
            props.setToken(true)
        } else if (token.result === 0) {
            alert(token.message);
        } 
    }

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
        
    };
    
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    return (
        <>
        <ThemeProvider theme={theme}>
        <Grid container spacing={0}>
            <Grid item xs={width >= height && height >= 725 ? 8 : 12}>
                <Box component="form" sx={{width: '100%', minHeight: '100vh', backgroundColor: 'white', color: '#000078'}}>
                    <Slide in={page === 0} onExited={() => {setPage(1)}} direction="right" appear={false} mountOnEnter unmountOnExit>
                        <div>
                        <Container sx={{py: '5vh', height: 'auto'}}>
                            <Grid container spacing={0}>
                                <Grid item xs={width >= height && height >= 725 ? 2 : 0}/>
                                <Grid item xs={width >= height && height >= 725 ? 8 : 12}>
                                    <Container sx={{width: '100%', height: 'auto', pb: '5%', overflowY: 'auto'}}>
                                        <Typography align="center" variant='h3'>Welcome Back</Typography>
                                        <Stack spacing={4} alignItems='center' sx={{pt: '5vh'}}>
                                            <TextField 
                                                defaultValue={email} 
                                                id="email" 
                                                label="Email" 
                                                variant="outlined" 
                                                required 
                                                onChange={e => setEmail(e.target.value)} 
                                                title="Please fill in this field"
                                                sx={{minWidth: '210px' , width: '50%'}}
                                            />
                                            <TextField 
                                                defaultValue={password} 
                                                id="password" 
                                                label="Password" 
                                                type={showPassword ? 'text' : 'password'} 
                                                variant="outlined" 
                                                required 
                                                sx={{minWidth: '210px' , width: '50%'}}
                                                onChange={e => setPassword(e.target.value)} 
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
                                            <Button 
                                                onClick= {() => {handleLogin()}} 
                                                disabled={!validateForm()}
                                                text="Login"
                                            />
                                            <Button 
                                                onClick={() => {setPage(3); setShowPassword(false)}} 
                                                text="Register"
                                                color={1}
                                            />
                                        </Stack>
                                    </Container>
                                </Grid>
                                <Grid item xs={width >= height && height >= 725 ? 2 : 0}/>
                            </Grid>
                        </Container>
                        </div>
                    </Slide>
                    <Slide in={page === 1} onExited={() => {setPage(0)}} direction="left" mountOnEnter unmountOnExit>
                        <div>
                        <Container sx={{py: '5vh', height: '100vh', overflow: 'scroll'}}>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={8}>
                                    <Typography align="center" variant='h3'>Start your Mentoring Journey Today</Typography>
                                    <Container sx={{height: 'auto', width: '100%', py: '5vh', alignContent: 'center'}}>
                                        <Stack spacing={4} alignItems='center'>
                                            <Typography align="center" variant='h4'>Register</Typography>
                                            <TextField 
                                                defaultValue={newEmail} 
                                                id="new-email" 
                                                label="Email" 
                                                type="email" 
                                                variant="outlined" 
                                                onChange={e => setNewEmail(e.target.value)} 
                                                required 
                                                sx={{minWidth: '210px' , width: '50%'}}
                                            />
                                            <TextField 
                                                defaultValue={newPassword} 
                                                helperText="Minimum eight characters, at least one letter, one number and one special character"
                                                id="new-password" 
                                                label="Password" 
                                                type={showPassword ? 'text' : 'password'} 
                                                variant="outlined" 
                                                onChange={e => setNewPassword(e.target.value)} 
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
                                            <TextField 
                                                defaultValue={first_name} 
                                                id="first-name" 
                                                label="First Name" 
                                                variant="outlined" 
                                                onChange={e => setFirstName(e.target.value)} 
                                                required 
                                                sx={{minWidth: '210px' , width: '50%'}}
                                            />
                                            <TextField 
                                                defaultValue={last_name} 
                                                id="second-name" 
                                                label="Last Name" 
                                                variant="outlined" 
                                                onChange={e => setLastName(e.target.value)} 
                                                required 
                                                sx={{minWidth: '210px' , width: '50%'}}
                                            />
                                            <Autocomplete 
                                                onOpen={() => {setBusinessOpen(true)}} 
                                                onClose={() => {setBusinessOpen(false)}} 
                                                id="business" options={businessOptions} 
                                                loading={loadingBusiness}
                                                sx={{minWidth: '210px' , width: '50%'}} 
                                                onChange={(e ,option) => {setBusiness(option.Name)}} 
                                                getOptionLabel={(option) => option.Name} 
                                                renderInput={(params) => <TextField {...params} label="Business Area" required/>}
                                            />
                                            <Autocomplete 
                                                onOpen={() => {setBranchOpen(true)}} 
                                                onClose={() => {setBranchOpen(false)}} 
                                                options={branchOptions} 
                                                loading={loadingBranch}
                                                sx={{minWidth: '210px' , width: '50%'}} 
                                                onChange={(e ,option) => {setBranch(option.Name)}} 
                                                getOptionLabel={(option) => option.Name} 
                                                renderInput={(params) => <TextField {...params} label="Branch" required/>}
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
                                                onClick= {() => {handleRegister()}} 
                                                disabled={!validateRegistration()}
                                                text="Register"
                                            />
                                            <Button 
                                                onClick={() => {setPage(3); setShowPassword(false)}} 
                                                text="Back"
                                                color={1}
                                            />
                                        </Stack>
                                    </Container>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                        </Container>
                        </div>
                    </Slide>
                </Box>
            </Grid>
            <Grid item xs={width >= height && height >= 500 ? 4 : 0}>
                {width >= height && height >= 500 && 
                    <Box sx={{maxWidth: '100%', height: '100vh', m: '0',backgroundColor: '#0018A8', overflow: 'hidden', position: 'fixed'}}>
                        <img src={Mentor} height="100%" style={{opacity: "0.35", position: 'relative', left: '-300px'}}/>
                    </Box>
                }
            </Grid>
        </Grid>
        </ThemeProvider>                                   
        </>
    )  
}
