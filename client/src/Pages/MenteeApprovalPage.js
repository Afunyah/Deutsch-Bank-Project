import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import { Grid, Typography, Stack, Chip, Box, CircularProgress } from '@mui/material';
import Button from '../Components/Button';
import TagDisplay from '../Components/TagDisplay';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')


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
    const [loadingGet, setLoadingGet] = useState(true);
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
            setLoadingGet(false);
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

        await fetch ('http://localhost:3001/api/mrs/mentor', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'mentee_id': menteeID, 'type': acceptOrReject, 'mentor_id': localStorage.getItem('user_id')})
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
                <Stack spacing={{xs: 2, sm: 2, md: 4, lg: 6, xl: 8}}>
                    <Typography variant="h4" textAlign={"center"}>Approve a Mentee</Typography>
                    <Typography variant="h5" textAlign={"center"}>A mentee has been matched with you. Would you like to mentor them?</Typography>
                    {(loadingGet || loadingPost) &&
                        <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <StyleCircularProgress/>
                        </Box>
                    }
                    {!loadingGet && !loadingPost &&
                        <>    
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Name:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={mentee.first_name + " " + mentee.last_name}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Business Area:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <StyleChip label={mentee.business}/>
                                </Grid>
                                <Grid item xs={2}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={2}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <Typography>Developmental Interests:</Typography>
                                </Grid>
                                <Grid item xs={5} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <TagDisplay tags={mentee.interests}/>
                                </Grid>
                                <Grid item xs={2}/>
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
                        </>
                    }
                    {error &&
                        <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                    }
                </Stack>
            </>
        )
    }
    else {
        return (
            <>
                {loadingGet && loadingPost &&
                    <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {!loadingGet && !loadingPost &&
                        <Stack spacing={4}>
                            <Box sx={{display: 'flex',justifyContent: 'center', pt: '5%'}}>
                                <Typography variant="h5" textAlign={"center"}>A mentee has been matched with you. Would you like to mentor them?</Typography>
                            </Box>
                            <Typography>Name:</Typography>
                            <StyleChip label={mentee.first_name + " " + mentee.last_name}/>
                            <Typography>Business Area:</Typography>
                            <StyleChip label={mentee.business}/>
                            <Typography>Developmental Interests:</Typography>                       
                            <TagDisplay tags={mentee.interests}/>   
                            <Box sx={{display: 'flex', justifyContent: 'space-evenly', pb: '10%'}}>                                       
                                <Button text="Accept" onClick={() => {updateSystemWithResponse("Accept", mentee._id)}}></Button>                   
                                <Button text="Reject" onClick={() => {updateSystemWithResponse("Reject", mentee._id)}} color={1}></Button>
                            </Box>                              
                        </Stack>
                }
            </>
        )
    }
        
}

export default MenteeApprovalPage;