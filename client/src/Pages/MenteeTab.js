import React, { useEffect, useState } from 'react';
import { Typography, Grid, Stack, CircularProgress, Chip, Box } from '@mui/material';
import { withStyles } from '@mui/styles';
import Button from '../Components/Button';
import HorizontalCarousel from '../Components/HorizontalCarousel';
import TagDisplay from '../Components/TagDisplay';

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

function MenteeTab(props) {
    const [menteesInfo, setMenteesInfo] = useState();
    const [loading, setLoading] = useState(true);

    function loadUser(userID) {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/user/dashboard', {
                method: 'POST',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: localStorage.getItem('user_id'),
                    mentor_id: null,
                    mentee_array: localStorage.getItem('mentees')
                })
            })
            const givenMentor = await response.json();
            setMenteesInfo(givenMentor);
            setLoading(false);
        })();
    }
    
    useEffect(() => {
        if (loading && localStorage.getItem('mentees') !== "null") {
            loadUser(localStorage.getItem('mentorId'));
        }
    });

    if (localStorage.getItem('isMentor') === 'false') {
        return (         
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent:'center', height: '25vh', overflow: 'auto'}}>
                <Stack spacing={{xs: 0, sm: 0, md: 2, lg: 3, xl: 4}} alignItems={"center"}>
                    <Typography component={'span'} sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>You aren't currently a mentor. Would you like to become one?</Typography>
                    <Button buttonClass="SidePageButton" buttonId="Become Mentor" text="Become a Mentor"/>
                </Stack>
            </Box> 
        );
    }
    else if (localStorage.getItem('isMentor') === 'true' && localStorage.getItem('mentees') === '[]') {
        return (
            <Box sx={{ height: '25vh', display: 'flex', alignItems: 'center', px: '5vw', overflow: 'auto'}}>
                <Typography component={'span'} align='center' sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Our mentoring systems are mentee-driven. You will get requests from suitable mentees shortly</Typography>
            </Box>  
        );
    }
    else {
        return (
            <>
            {!loading && 
                <HorizontalCarousel components={
                    menteesInfo.map((elem, index) => {
                        return (
                                <Grid container spacing={2}>
                                    <Grid item xs={9}>
                                        <Stack spacing={1}>
                                            <Grid container spacing={0}>
                                                <Grid item xs={5} alignItems='center'>
                                                    <Typography component={'span'} sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Mentee Name: </Typography>
                                                </Grid>
                                                <Grid item xs={7} alignItems='center'>
                                                    <TagDisplay tags={[{'Name' : elem.user[0].first_name + " " + elem.user[0].last_name}]}/>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={0}>
                                                <Grid item xs={5} alignItems='center'>
                                                    <Typography component={'span'} sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Developmental Interests: </Typography>
                                                </Grid>
                                                <Grid item xs={7} alignItems='center'>
                                                    <TagDisplay tags={elem.user[0].interests}/>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={0}>
                                                <Grid item xs={5} alignItems='center'>
                                                    <Typography component={'span'} sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Next Meeting: </Typography>
                                                </Grid>
                                                <Grid item xs={7} alignItems='center'>
                                                    {elem.meetings.length === 0 &&
                                                        <Typography component={'span'} variant="h6">No Meeting Scheduled with {elem.user[0].first_name}</Typography>
                                                    }
                                                    {elem.meetings.length !== 0 && elem.meetings[0].status === "Requested" &&
                                                        <Typography component={'span'} variant="h6">Meeting Requested with {elem.user[0].first_name} at {elem.meetings[0].timeString} on {new Date(elem.meetings[0].StartDateTime).toLocaleDateString()}</Typography>
                                                    }
                                                    {elem.meetings.length !== 0 && elem.meetings[0].status === "Upcoming" &&
                                                        <Typography component={'span'} variant="h6">Meeting Scheduled with {elem.user[0].first_name} at {elem.meetings[0].timeString} on {new Date(elem.meetings[0].StartDateTime).toLocaleDateString()}</Typography>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Box sx={{height: '100%', display: 'flex', alignItems: 'center'}}>
                                            <Stack spacing={2}>
                                                {menteesInfo.length > 1 &&
                                                    <Button text="Schedule Group Session" buttonClass={"SidePageButton"} buttonId={"Group Session"}/>
                                                }
                                                <Button text="End Mentorship" buttonClass={"SidePageButton"} buttonId={"End Mentorship"} onClick={() => {localStorage.setItem('emId', elem.user[0]._id)}} color={1}/>                                                
                                            </Stack>
                                        </Box>
                                    </Grid>
                                </Grid>
                            )
                    })
                }/>
            }   
            {loading &&
                <Box sx={{width: '100%', height: '25vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <StyleCircularProgress/>
                </Box>
            } 
            </>             
        )
    }
}

export default MenteeTab;