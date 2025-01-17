import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import VerticalFourBox from "../Components/VerticalFourBox";
import { Grid, Typography, Stack, Chip, Box, CircularProgress } from '@mui/material';
import Button from '../Components/Button';
import TagDisplay from '../Components/TagDisplay';
import { ThemeProvider, withStyles } from '@mui/styles';
import theme from '../Components/Theme';

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



function GroupApprovalPage(props){
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [mentor, setMentor] = useState();
    const [loadingGet, setloadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    const [SessDate, setSessDate] = useState(Date());
    const [StartTime, setStartTime] = useState();
    const [EndTime, setEndTime] = useState();


    function loadUser(userID) {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/user/' + userID, {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const givenMentor = await response.json();
            setMentor(givenMentor);
            setloadingGet(false);
            var sessStartDate = props.getAlerts.details.item.Details.StartDateTime;
            var sessEndDate = props.getAlerts.details.item.Details.EndDateTime;

            sessStartDate = new Date(sessStartDate);
            sessEndDate = new Date(sessEndDate);

            setSessDate(sessStartDate.toDateString());
            setStartTime(sessStartDate.toLocaleTimeString().substr(0,5));
            setEndTime(sessEndDate.toLocaleTimeString().substr(0,5));
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

    async function updateSystemWithResponse(acceptOrReject) {
        setLoadingPost(true)
        setError(false)
        await fetch ('http://localhost:3001/api/group/approveSession', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({  "mentee_id": localStorage.getItem('user_id'),
                                    "mentor_id": mentor._id, 
                                    "type": acceptOrReject, 
                                    "details": props.getAlerts.details
                                })
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
                        <Stack spacing={4}>
                            <Box sx={{display: 'flex',justifyContent: 'center', pt: '5%'}}>
                                <Stack spacing={2}>
                                    <Typography variant="h4" textAlign={"center"}>Group Session Invitation</Typography>
                                    <Typography variant="h5" textAlign={"center"}>Please approve or reject this meeting request.</Typography>
                                </Stack>
                            </Box>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Mentor:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={mentor.first_name + " " + mentor.last_name}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Topic:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.item.Name}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Tag:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.item.Tag}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Date:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={SessDate}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Time:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={StartTime + " - " + EndTime}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Location:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={props.getAlerts.details.item.Details.Location}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Accept" onClick={() => {updateSystemWithResponse("Accept")}}></Button>
                                </Grid>
                                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                    <Button text="Reject" onClick={() => {updateSystemWithResponse("Reject")}} color={1}></Button>
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
                                    <Typography variant="h5" textAlign={"center"}>Group Session Invitation</Typography>    
                                    <Typography variant="h6" textAlign={"center"}>Please approve or reject this meeting request.</Typography>
                                </Stack>
                            </Box>
                            <Typography>Mentor:</Typography>
                            <StyleChip label={mentor.first_name + " " + mentor.last_name}/>
                            <Typography>Topic:</Typography>
                            <StyleChip label={props.getAlerts.details.item.Name}/>
                            <Typography>Tag:</Typography>                       
                            <StyleChip label={props.getAlerts.details.item.Tag}/>
                            <Typography>Date:</Typography>                       
                            <StyleChip label={SessDate}/> 
                            <Typography>Time:</Typography>                       
                            <StyleChip label={StartTime + " - " + EndTime}/>   
                            <Typography>Location:</Typography> 
                            <StyleChip label={props.getAlerts.details.item.Details.Location}/>  
                            <Box sx={{display: 'flex', justifyContent: 'space-evenly', pb: '10%'}}>                                       
                                <Button text="Accept" onClick={() => {updateSystemWithResponse("Accept")}}></Button>                   
                                <Button text="Reject" onClick={() => {updateSystemWithResponse("Reject")}} color={1}></Button>
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

export default GroupApprovalPage;