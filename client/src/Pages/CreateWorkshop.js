import React, { useState, useEffect } from 'react';
import { TextField, Stack, Typography, Switch, Container, Box, Autocomplete, CircularProgress, Grid } from '@mui/material'; 
import Button from '../Components/Button.js';
import DateSelector from '../Components/DateSelector';
import { withStyles } from "@mui/styles";
import theme from '../Components/Theme';
import { ThemeProvider } from '@mui/material/styles';
const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

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




function CreateWorkshop(props) {
    const [selected, setSelected] = useState();
    const [options, setOptions] = useState("");
    const [loadingGet, setLoadingGet] = useState(true);
    const [workshopName, setName] = useState("");
    const [venueName, setVenue] = useState("");
    const [capacity, setCapacity] = useState("0");
    const [online, setOnline] = useState(false);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("13:00");
    const [date, setDate] = useState("");
    const [onlineAddress, setOnlineAddress] = useState("");
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    async function createWorkshop() {
        setLoadingPost(true)
        setError(false)
        var startTimeArray = startTime.split(":");
        var endTimeArray = endTime.split(":");
        var startDateTime = new Date(date);
        startDateTime.setHours( Number(startTimeArray[0]));
        startDateTime.setMinutes(Number(startTimeArray[1]));
        var endDateTime = new Date(date);
        endDateTime.setHours(Number(endTimeArray[0]));
        endDateTime.setMinutes(Number(endTimeArray[1]));
        await fetch ('http://localhost:3001/api/workshops/createWorkshop', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tag: selected,
                name: workshopName, 
                capacity: capacity,
                mentorIDs: [localStorage.getItem('user_id')],
                details: {
                    startDateTime: startDateTime,
                    endDateTime: endDateTime,
                    location: (online ? onlineAddress : venueName),
                    isOnline: online,
                    branch: localStorage.getItem('branch')
            }
            })
        })
        .then((response) => {
            if (response.status === 200) {
                document.getElementById('sidePageChevron').click()
            }
            else {
                setError(true)
                setLoadingPost(false)
            }
            
        })
    }

    async function updateSystemWithResponse(acceptOrReject) {
        setLoadingPost(true)
        setError(false)
        await fetch ('http://localhost:3001/api/workshops/approveRecommended', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"mentor_id": localStorage.getItem('user_id'), "type": acceptOrReject, "details": props.getAlerts.details})
        })
        .then((response) => {
            if (response.status === 200) {
                props.deleteAlert(props.getAlerts)
            }
            else {
                setError(true)
                setLoadingPost(false)
            }
            
        })
    }

    function loadTags() {
        if(props.getAlerts !== undefined){
            setSelected(props.getAlerts.details.tag);
            setLoadingGet(false);
            return;
        }

        (async () => {
          var branchName = localStorage.getItem('branch');
          const response = await fetch ('http://localhost:3001/api/tags', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  "api-key": key['key']
              },
              body: JSON.stringify({branchName : branchName})
          })
          const tags = await response.json();
          setOptions(tags);
          setLoadingGet(false);
        })();
    }

    useEffect(() => {
        if (loadingGet) {
            loadTags();
        }
    });

    function validateInfo() {
        return workshopName.length > 0 && venueName.length > 0 && startTime < endTime && Number(capacity) > 0 && date.length > 0;
    }


    return (
        <ThemeProvider theme={theme}>
        <Container sx={{pb: '5vh', width: '90%'}}>
                <Stack spacing={2}>
                    <Typography variant="h4" textAlign={"center"}>Create a Workshop</Typography>
                    {!loadingGet && !loadingPost &&
                        <>
                        <Typography variant="h5" textAlign={"center"}>Fill the fields below.</Typography>
                        <TextField label="Workshop Name"  variant="outlined" required onChange={e => setName(e.target.value)}/>
                        <DateSelector changeFunction={(newValue) => {setDate(newValue)}}/>
                        <TextField label="Start Time" type="time" defaultValue="08:00" onChange={e => setStartTime(e.target.value)}/>
                        <TextField label="End Time" type="time" defaultValue="13:00" onChange={e => setEndTime(e.target.value)}/>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <Stack>
                            <Typography align='center'>Host Online?</Typography>
                            <CustomSwitch checked={online} onChange={() => {setOnline(!online)}}/>
                            </Stack>
                        </Box>
                        {!online &&
                            <TextField label="Venue" onChange={e => setVenue(e.target.value)}/>
                        }
                        {online &&
                            <TextField label="Link to Online Workshop" onChange={e => setOnlineAddress(e.target.value)}/>
                        }
                        <TextField label="Capacity" type="number" onChange={e => setCapacity(e.target.value)}></TextField>

                        {(props.getAlerts === undefined) && 
                            <>
                            <Autocomplete 
                                options={options} 
                                onChange={(e, option) => {setSelected(option)}}
                                getOptionLabel={(option) => option.Name}
                                renderInput={(params) => <TextField {...params} label="Workshop Topic" required/>}
                            />
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                <Button 
                                    onClick= {() => {createWorkshop()}}
                                    text='Create Workshop'
                                    disabled={!(workshopName.length > 0 && (venueName.length > 0 || onlineAddress.length > 0) && startTime < endTime && selected !== undefined)}
                                />
                            </Box>
                            </>
                        }

                        {(props.getAlerts !== undefined) && 
                            <>
                            <TextField defaultValue={props.getAlerts.details.tag.Name} disabled="true" label="Workshop Topic" required/>
                            <Grid container spacing={2}>
                                <Grid item xs={2}/>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Create Workshop" onClick= {() =>{updateSystemWithResponse("Accept"); createWorkshop()}}></Button>
                                </Grid>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Reject" onClick= {()=>{updateSystemWithResponse("Reject")}} color={1}></Button>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            </>
                        }
                        </>
                    }
                    {(loadingGet || loadingPost) && 
                    <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                    }
                    {error &&
                        <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                    }
                </Stack>     
        </Container>    
                          
         
        </ThemeProvider>   
    );
}

export default CreateWorkshop;