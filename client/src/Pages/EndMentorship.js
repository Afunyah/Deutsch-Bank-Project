import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import { Typography, Stack, Box, CircularProgress, Container, TextField } from '@mui/material';
import Button from '../Components/Button';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);



function EndMentorshipPage(props){
    const [mentorInfo, setMentorInfo] = useState();
    const [loadingGet, setloadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);
    const [reason, setReason] = useState("");

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
            setMentorInfo(givenMentor);
            setloadingGet(false);
        })();
      }

      async function endMentorshipEndpoint() {
          setLoadingPost(true)
          setError(false)
          var mentee_id = "";
          var mentor_id = "";
        if (localStorage.getItem('emId') === localStorage.getItem('mentorId')) {
            mentee_id = localStorage.getItem('user_id')
            mentor_id = localStorage.getItem('emId')
        }
        else {
            mentee_id = localStorage.getItem('emId')
            mentor_id = localStorage.getItem('user_id')
        }

        const response = await fetch ('http://localhost:3001/api/mrs/end', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "mentor_id": mentor_id, 
                "mentee_id": mentee_id, 
                "reason": "" + reason
            })
        })
        .then((response) => {
            if (response.status === 200) {
                if (localStorage.getItem('emId') === localStorage.getItem('mentorId')) {
                    localStorage.setItem('mentorId', 'null')
                    localStorage.setItem('mentorStatus', 'null')
                }
                else {
                    var menteeArray = localStorage.getItem('mentees')
                    menteeArray.slice(menteeArray.indexOf({"mentee": localStorage.getItem('emId')}), 1)
                    
                }
                document.getElementById('sidePageChevron').click()
            }
            else {
                setError(true)
                setLoadingPost(false)
            }
            
        })
    }
    
    useEffect(() => {
        if (loadingGet) {
            loadUser(localStorage.getItem('emId'));
        }
    });
    
    return (
        <>
        <Container padding={2} alignItems='center' justifyContent='center' sx={{height: '85%', width: '100%'}}>
                <Stack spacing={2}>
                    <Typography variant="h4" textAlign={"center"}>Ending your Mentorship</Typography>
                    {!loadingGet &&
                        <Typography variant="h5" textAlign={"center"}>Are you sure you want to end your mentorship with {mentorInfo.first_name + " " + mentorInfo.last_name}?</Typography>
                    }
                </Stack>
            {(loadingGet || loadingPost) && 
                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                    <StyleCircularProgress/>
                </Box>
            }
            {!loadingGet && !loadingPost &&
                <>
                <Container sx={{pt: '5%', pb: '3%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Stack spacing={4}>
                        <TextField label="Reason for Ending Mentorship" onChange={(value) => {setReason(value)}}/>
                        <Box sx={{display: 'flex',justifyContent: 'center', alignItems: 'center'}}>
                            <Button text="End Mentorship" color={1} onClick={() => {endMentorshipEndpoint()}}/>
                            <Box sx={{width: '10%'}}/>
                            <Button text="Keep Mentoring Partner" buttonClass="SidePageButton"/>
                        </Box>
                    </Stack>
                </Container>
                </>
            }   
            {error &&
                <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
            }
            </Container>
        </>
    )
}

export default EndMentorshipPage;