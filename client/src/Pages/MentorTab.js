import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, Box, Stack, Chip, CircularProgress} from '@mui/material';
import Button from '../Components/Button';
import { withStyles } from '@mui/styles';
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

function MentorTab(props) {
    const [mentorInfo, setMentorInfo] = useState();
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
                    mentor_id: localStorage.getItem('mentorId'),
                    mentee_array: null
                })
            })
            const givenMentor = await response.json();
            setMentorInfo(givenMentor);
            setLoading(false);
        })();
      }
    
      useEffect(() => {
        if (loading && localStorage.getItem('mentorStatus') === "Set") {
            loadUser(localStorage.getItem('mentorId'));
        }
      });


    if (localStorage.getItem('mentorStatus') === "null") {
        return (
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent:'center', height: '25vh', overflow: 'auto'}}>
                <Stack spacing={{xs: 0, sm: 0, md: 2, lg: 3, xl: 4}} alignItems={"center"}>
                    <Typography sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 24, xl: 24}}}>It looks like you don't have a Mentor</Typography>
                    <Button buttonClass="SidePageButton" buttonId="Request Mentor" text="Request a Mentor"/>
                </Stack>
            </Box>
        );
    }
    else if (localStorage.getItem('mentorStatus') === "Awaiting Mentors") {
        return (
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent:'center', height: '25vh', overflow: 'auto'}}>
                <Stack spacing={{xs: 0, sm: 0, md: 2, lg: 3, xl: 4}} alignItems={"center"}>
                    <Typography sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 24, xl: 24}}}>You are in the process of getting a mentor</Typography>
                    <Button buttonClass="SidePageButton" buttonId="Mentor Selection Page" text="See Progress"/>
                </Stack>
            </Box>  
        )
    }
    else {
        return (
            <>
            {!loading && 
                <Container sx={{pt:'1%'}}>
                    <Grid container spacing={2}>
                        <Grid item xs={9}>
                            <Stack spacing={1}>
                                <span/>
                                <Grid container spacing={0}>
                                    <Grid item xs={5} alignItems='center'>
                                        <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Mentor Name: </Typography>
                                    </Grid>
                                    <Grid item xs={7} alignItems='center'>
                                        <TagDisplay tags={[{'Name' : mentorInfo.user[0].first_name + " " + mentorInfo.user[0].last_name}]}/>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={0}>
                                    <Grid item xs={5} alignItems='center'>
                                        <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Areas of Expertise: </Typography>
                                    </Grid>
                                    <Grid item xs={7} alignItems='center'>
                                        <TagDisplay tags={mentorInfo.user[0].aoe}/>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={0}>
                                    <Grid item xs={5} alignItems='center'>
                                        <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Next Meeting: </Typography>
                                    </Grid>
                                    <Grid item xs={7} alignItems='center'>
                                        {mentorInfo.meetings.length === 0 &&
                                            <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>No Meeting Scheduled with {mentorInfo.user[0].first_name}</Typography>
                                        }
                                        {mentorInfo.meetings.length !== 0 && mentorInfo.meetings[0].status === "Requested" &&
                                            <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Meeting Requested with {mentorInfo.user[0].first_name} at {mentorInfo.meetings[0].timeString} on {new Date(mentorInfo.meetings[0].StartDateTime).toLocaleDateString()}</Typography>
                                        }
                                        {mentorInfo.meetings.length !== 0 && mentorInfo.meetings[0].status === "Upcoming" &&
                                            <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>Meeting Scheduled with {mentorInfo.user[0].first_name} at {mentorInfo.meetings[0].timeString} on {new Date(mentorInfo.meetings[0].StartDateTime).toLocaleDateString()}</Typography>
                                        }
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Grid> 
                        <Grid item xs={3}>
                            <Box sx={{height: '100%', display: 'flex', alignItems: 'center'}}>
                                <Stack spacing={2}>
                                    {mentorInfo.meetings.length === 0 &&
                                        <Button text="Schedule a Meeting" buttonClass={"SidePageButton"} buttonId={"Schedule Meeting"}/>
                                    }
                                    {mentorInfo.meetings.length !== 0 &&
                                        <Button text="Cancel Meeting" buttonClass={"SidePageButton"} buttonId={"Cancel Meeting"} color={1}/>
                                    }
                                    <Button text="End Mentorship" buttonClass={"SidePageButton"} buttonId={"End Mentorship"} onClick={() => {localStorage.setItem('emId', mentorInfo.user[0]._id)}} color={1}/>                   
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
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

export default MentorTab;