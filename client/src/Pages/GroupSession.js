import React, { useEffect, useState } from 'react';
import { CircularProgress, Typography, Container, Stack, Box, TextField, Switch, Autocomplete } from '@mui/material';
import { withStyles } from '@mui/styles';
import DateSelector from '../Components/DateSelector';
import TagSelector from '../Components/TagDisplay';
import Button from '../Components/Button';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../Components/Theme';

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

export default function GroupSessions() {
    const [menteesInfo, setMenteesInfo] = useState();
    const [loadingPost, setLoadingPost] = useState(false);
    const [loadingGet, setLoadingGet] = useState(true);
    const [error, setError] = useState(false);
    const [date, setDate] = useState(new Date());
    const [selected, setSelected] = useState();
    const [selectedMentees, setSelectedMentees] = useState([]);
    const [startTime, setStartTime] = useState("9:00");
    const [endTime, setEndTime] = useState("10:00");
    const [online, setOnline] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Something went wrong. Please try again.")
    const [venue, setVenue] = useState("");
    const [topic, setTopic] = useState("");
    const [onlineAddress, setOnlineAddress] = useState("");
    const [options, setOptions] = useState([]);

    async function getRelevantMentees(tag) {
        var mentees = [];
        for (var i = 0; i < menteesInfo.length; i++)
        {for (var j = 0; j < menteesInfo[i].user[0].interests.length; j++) {
            if (menteesInfo[i].user[0].interests[j].Name === tag.Name) {
                mentees.push(menteesInfo[i].user[0]._id)
                break;
            }
        }}
        return mentees
    }


    async function createSession() {
        setLoadingPost(true)
        setError(false)
        var branchName = localStorage.getItem('branch');
        var userID = localStorage.getItem('user_id');

        var mentees = await getRelevantMentees(selected);
        if (mentees.length > 1) {
            var startTimeArray = startTime.split(":");
            var endTimeArray = endTime.split(":");
            var startDateTime = new Date(date);
            startDateTime.setHours( Number(startTimeArray[0]));
            startDateTime.setMinutes(Number(startTimeArray[1]));
            var endDateTime = new Date(date);
            endDateTime.setHours(Number(endTimeArray[0]));
            endDateTime.setMinutes(Number(endTimeArray[1]));
            return fetch ('http://localhost:3001/api/group/createGroupSession', {
                method: 'POST',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tag: selected,
                    Name: topic,
                    menteeIds: mentees,
                    mentor_id: userID,
                    Details: {
                        StartDateTime: startDateTime,
                        EndDateTime: endDateTime,
                        Location: (online ? onlineAddress : venue),
                        isOnline: online,
                        Branch: branchName
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
                    setErrorMessage("Something went wrong. Please try again.")
                }
                
            })
        }
        else {
            setError(true)
            setErrorMessage("Not enough mentees are interested in that topic")
        }

        
    }

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
            setOptions(givenMentor[0].mentor_aoe)
            setLoadingGet(false);
        })();
    }

    useEffect(() => {
        if (loadingGet) {
            loadUser(localStorage.getItem('mentorId'));
        }
    });

    return (
        <ThemeProvider theme={theme}>
        <Container padding={2} alignItems='center' justifyContent='center'>
            <Stack spacing={2}>
                <Typography align='center' sx={{color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>Schedule a Group Tutoring Session</Typography>
                <Typography align='center'>Fill in the fields below and invites will be sent to all mentees with the relevant interests:</Typography>
                {!loadingGet && !loadingPost &&
                        <>
                        <TextField label="Topic" onChange={e => setTopic(e.target.value)}/>
                        <DateSelector 
                            changeFunction={(newValue) => {setDate(newValue)}}>
                        </DateSelector>
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
                        <Autocomplete 
                            options={options} 
                            onChange={(e,value) => {setSelected(value)}}
                            getOptionLabel={(option) => option.Name}
                            renderInput={(params) => <TextField {...params} label="Workshop Topic" required/>}
                        />
                        <Box sx={{pt: '5%', pb: '3%', display: 'flex', justifyContent: 'center'}}>
                            <Button text="Create Session" onClick={()=>{createSession()}}
                                disabled={!(topic.length > 0 && (venue.length > 0 || onlineAddress.length > 0) && selected !== undefined)}
                            />
                        </Box>
                        </>
                }
                {(loadingGet || loadingPost) && 
                    <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {error &&
                    <Typography align='center' variant='h5' color='error'>{errorMessage}</Typography>
                }
            </Stack>
        </Container> 
        </ThemeProvider>
    )
}