import React, { useEffect, useState } from 'react';
import { Container, Stack, TextField, Typography, Box, CircularProgress } from '@mui/material';
import Button from '../Components/Button';
import theme from '../Components/Theme';
import { ThemeProvider } from '@mui/material/styles';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);


function CreateMilestones(props) {
    const [milestoneOne, setMilestoneOne] = useState("");
    const [milestoneTwo, setMilestoneTwo] = useState("");
    const [milestoneThree, setMilestoneThree] = useState("");
    const [menteeInfo, setMenteeInfo] = useState();
    const [loadingGet, setLoadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);


    const handleChangeOne = (event) => {
        if (event.target.value === "") {
            setMilestoneOne(milestoneTwo)
            setMilestoneTwo(milestoneThree)
            setMilestoneThree("")
        }
        else {
            setMilestoneOne(event.target.value)
        }
    };

    const handleChangeTwo = (event) => {
        if (event.target.value === "") {
            setMilestoneTwo(milestoneThree)
            setMilestoneThree("")
        }
        else {
            setMilestoneTwo(event.target.value)
        }
    };

    const handleChangeThree = (event) => {
        setMilestoneThree(event.target.value)
    };

    async function addMilestoneEndpoint() {
        setLoadingPost(true)
        setError(false)
  
        const response = await fetch ('http://localhost:3001/api/milestones', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "user_associated": props.getAlerts.sender, 
                "milestones" : (milestoneThree === "" ? (milestoneTwo === "" ? [milestoneOne] : [milestoneOne, milestoneTwo]) : [milestoneOne, milestoneTwo, milestoneThree]),
                "user_id" : localStorage.getItem('user_id')
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
            setMenteeInfo(givenMentee);
            setLoadingGet(false);
        })();
    }

    useEffect(() => {
        if (loadingGet) {
            loadUser(props.getAlerts.sender);
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <Container sx={{pb: '5vh', width: '90%'}}>
            <Stack spacing={4}>
                <Typography sx={{fontSize: {xs: 16, sm: 20, md: 24, lg: 34, xl: 34}, color: '#000078'}} textAlign={"center"}>Mentee Milestones</Typography>
                    {!loadingGet && !loadingPost &&
                            <>
                            <Typography sx={{fontSize: {xs: 14, sm: 16, md: 20, lg: 24, xl: 24}, color: '#000078'}} textAlign={"center"}>Please provide {menteeInfo.first_name} with up to 3 steps they can take to develop professionally</Typography>
                            <TextField label='Milestone One' value={milestoneOne} onChange={handleChangeOne}/>
                            {milestoneOne !== "" &&
                                <TextField label='Milestone Two' value={milestoneTwo} onChange={handleChangeTwo}/>
                            }
                            {milestoneTwo !== "" &&
                                <TextField label='Milestone Three' value={milestoneThree} onChange={handleChangeThree}/>
                            }
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                <Button 
                                    text={milestoneTwo !== "" ? 'Add Milestones' : 'Add Milestone'}
                                    disabled={milestoneOne === ""}
                                    onClick={() => {addMilestoneEndpoint()}}
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
                        <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                    }
                </Stack>
            </Container>
        </ThemeProvider>
    );
}

export default CreateMilestones;