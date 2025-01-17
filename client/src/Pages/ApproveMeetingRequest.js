import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import { Grid, Typography, Stack, Chip, Box, CircularProgress } from '@mui/material';
import Button from '../Components/Button';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')


/*
    Stylechip is the same as in TagDisplay.
    StyleCircularProgress is the loading icon which has been styled to match application aesthetic.
*/

const StyleChip = withStyles({
    root: {
      backgroundColor:'#5743DB',
      color: 'white'
    }
  })(Chip);

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);



function MenteeApprovalPage(props){
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [mentee, setMentee] = useState();
    const [loadingGet, setloadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    function loadUser(userID) {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/user/' + userID, {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const givenMentee = await response.json();
            setMentee(givenMentee);
            setloadingGet(false);
        })();
      }
    
      useEffect(() => {
        if (loadingGet) {
            loadUser(props.getAlerts.sender);
        }
      });

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    useEffect(() => {
        window.addEventListener("resize", sizeChange);
    })

    async function updateSystemWithResponse(acceptOrReject, menteeID) {
        setLoadingPost(true)
        setError(false)
        await fetch ('http://localhost:3001/api/times/approve', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"mentor_id": localStorage.getItem('user_id'), "mentee_id": menteeID, "type": acceptOrReject, "date": props.getAlerts.details.date_time, "time": props.getAlerts.details.meeting_time})
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
    

    if (width >= height && height >= 500) {
        return (
            <>
                {(loadingGet || loadingPost) && 
                    <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {!loadingGet && !loadingPost &&
                        <Stack spacing={2}>
                            <Box sx={{display: 'flex',justifyContent: 'center', pt: '5%'}}>
                                <Stack spacing={2}>
                                    <Typography variant="h4" textAlign={"center"}>Meeting Schedule Request</Typography>
                                    <Typography variant="h5" textAlign={"center"}>Please approve or reject this meeting request with you mentee.</Typography>
                                </Stack>
                            </Box>
                            <Grid container spacing={0}>
                                <Grid item xs={4}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Name:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={mentee.first_name + " " + mentee.last_name}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={4}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Date:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.meeting_date}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={4}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Time:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.meeting_time}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={4}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Duration:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={"1 Hour"}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={4}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Location:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.location}/>
                                </Grid>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Accept" onClick={() => {updateSystemWithResponse("Accept", mentee._id)}}></Button>
                                </Grid>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Reject" onClick={() => {updateSystemWithResponse("Reject", mentee._id)}} color={1}></Button>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                        </Stack>
                }
                {error &&
                    <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                }
            </>
        )
    }
    else {
        return (
            <>
                {(loadingGet || loadingPost) && 
                    <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {!loadingGet && !loadingPost &&
                        <Stack spacing={4}>
                            <Box sx={{display: 'flex',justifyContent: 'center', pt: '5%'}}>
                                <Stack>
                                    <Typography variant="h5" textAlign={"center"}>Meeting Schedule Request</Typography>    
                                    <Typography variant="h6" textAlign={"center"}>Please approve or reject this meeting request with you mentee.</Typography>
                                </Stack>
                            </Box>
                            <Typography>Name:</Typography>
                            <StyleChip label={mentee.first_name + " " + mentee.last_name}/>
                            <Typography>Date:</Typography>
                            <StyleChip label={props.getAlerts.details.meeting_date}/>
                            <Typography>Time:</Typography>                       
                            <StyleChip label={props.getAlerts.details.meeting_time}/>  
                            <Typography>Duration:</Typography> 
                            <StyleChip label={"1 Hour"}/>  
                            <Typography>Location:</Typography>
                            <StyleChip label={props.getAlerts.details.location}/>
                            <Box sx={{display: 'flex', justifyContent: 'space-evenly', pb: '10%'}}>                                       
                                <Button text="Accept" onClick={() => {updateSystemWithResponse("Accept", mentee._id)}}></Button>                   
                                <Button text="Reject" onClick={() => {updateSystemWithResponse("Reject", mentee._id)}} color={1}></Button>
                            </Box>                              
                        </Stack>
                }
                {error &&
                    <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                }
            </>
        )
    }
        
}

export default MenteeApprovalPage;