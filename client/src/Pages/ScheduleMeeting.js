import React, { useState, useEffect } from 'react';
import { Typography, Container, CircularProgress, TextField, Stack } from '@mui/material';
import { withStyles } from '@mui/styles';
import DateSelector from '../Components/DateSelector';
import TimeSelector from '../Components/TimeSelector';
import { Box } from '@mui/system';
import Button from '../Components/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../Components/Theme';

const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
    })(CircularProgress);



function ScheduleMeeting() {
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(null);
    const [times, setTimes] = useState([]);
    const [dateTime, setDateTime] = useState();
    const [submitTime, setSubmitTime] = useState();
    const [location, setLocation] = useState("")
    const [loadingGet, setloadingGet] = useState(false);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    function formatTimes(freeTimes) {
        var timeArray = []
        if (freeTimes === undefined) {
            return timeArray
        }

        for (var i = 0; i < freeTimes.length; i++) {
            var startTime = new Date(freeTimes[i][0])
            var endTime = new Date(freeTimes[i][1])
            timeArray[i] = startTime.getHours() + ":" + (startTime.getMinutes() < 10 ? "0" + startTime.getMinutes() : startTime.getMinutes()) + " - " + endTime.getHours() + ":" + (endTime.getMinutes() < 10 ? "0" + endTime.getMinutes() : endTime.getMinutes())
        }
        return timeArray
    }


    async function scheduleMeetingEndpoint(dateTime) {
        setLoadingPost(true)
        setError(false)
        dateTime = new Date(dateTime)
        var date = dateTime.getFullYear() + "-" + (dateTime.getMonth() < 10 ? "0" + (dateTime.getMonth() + 1) : (dateTime.getMonth() + 1) + 1) + "-" + (dateTime.getDate() < 10 ? "0" + dateTime.getDate() : dateTime.getDate())
        var start_time = (dateTime.getHours() + 1 < 10 ? "0" + dateTime.getHours() : dateTime.getHours()) + ":" + (dateTime.getMinutes() < 10 ? "0" + dateTime.getMinutes() : dateTime.getMinutes())
        await fetch ('http://localhost:3001/api/times/schedule', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mentor_id: localStorage.getItem('mentorId'), 
                mentee_id: localStorage.getItem('user_id'), 
                date: date, 
                start_time: start_time, 
                meeting_title: "",
                location: "" + location
            })
        }).then((response) => {
            if (response.status === 200) {
                document.getElementById('sidePageChevron').click()
            }
            else {
                setError(true)
                setLoadingPost(false)
                setSubmitTime()
                setShow(false)
            }
            
        })
    }


    function loadTimes(userID) {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/times/' + userID + '?day=' + date, {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const freeTimes = await response.json()
            setloadingGet(false);
            setShow(true);
            var user_id = localStorage.getItem('mentorId')
            setDateTime(freeTimes[user_id])
            setTimes(formatTimes(freeTimes[user_id]))
        })();
    }

    useEffect(() => {
        if (show) {
            setShow(false)
            setloadingGet(true)
            loadTimes(localStorage.getItem('mentorId'))
        }
    }, [date])

    return (
        <ThemeProvider theme={theme}>
        <Container padding={2} alignItems='center' justifyContent='center' sx={{height: '85%', width: '100%'}}>
                <Typography align='center' sx={{mb: '5vh', color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>Schedule a meeting with your Mentor</Typography>
                <Typography align='center' sx={{mb: '5vh'}}>Please pick a date that works for you:</Typography>
                {!loadingPost && <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <DateSelector 
                        changeFunction={(newValue) => {setShow(true); setDate(newValue); setSubmitTime()}}>
                    </DateSelector>
                </Box>}
                {!loadingPost && show && times.length > 0 && <Container>
                        <Typography align='center' sx={{mt: '5vh', mb: '5vh'}}>Here are the times that your Mentor is free that day. Please pick a time:</Typography>
                        <TimeSelector times={times} buttonState={(state) => {(state === submitTime ? setSubmitTime() : setSubmitTime(state))}}></TimeSelector>
                </Container>}
                {!loadingPost && show && times.length === 0 &&
                    <Typography align='center' sx={{mt: '5vh', mb: '5vh'}}>Your Mentor is not free that day</Typography>
                }
                {!loadingPost && show && submitTime >= 0 &&  
                            <Stack spacing={2} justifyContent='center'>
                                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                    <TextField label="Location" onChange={(e) => {setLocation(e.target.value)}} sx={{width: '50%'}}/>
                                </Box>
                                {location.length > 0 &&
                                    <Box sx={{py: '5%', display: 'flex', justifyContent: 'center'}}>
                                        <Button text="Send Request"onClick={() => {scheduleMeetingEndpoint(dateTime[submitTime][0])}}/>
                                    </Box>
                                }
                            </Stack>
                }
                {(loadingGet || loadingPost) && 
                    <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {error &&
                    <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                }
        </Container> 
        </ThemeProvider>  
    );
}

export default ScheduleMeeting;