import React, { useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import VerticalFourBox from "../Components/VerticalFourBox";
import { Grid, Typography, Stack, Chip, Box, CircularProgress } from '@mui/material';
import Button from '../Components/Button';
import TagDisplay from '../Components/TagDisplay';
import { ThemeProvider, withStyles } from '@mui/styles';
import theme from '../Components/Theme';

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

function sortMentorArray(oldArray) {
    var returnArray = [];
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i].mentor_status === "Accept") {
            returnArray = [...returnArray, oldArray[i]]

        }
    }
    for (var i = 0; i < oldArray.length; i++) {
        if (oldArray[i].mentor_status === "Pending") {
            returnArray = [...returnArray, oldArray[i]]

        }
    }
    return returnArray
}




function MentorSelectionPage(props){
    const [mentorStatus, setMentorStatus] = useState([]);
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [loadingGet, setLoadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    function loadUsers(userID) {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/mrs/status/' + userID + '?partnerships=true&detailed=true', {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const givenMentee = await response.json();
            setMentorStatus(sortMentorArray(givenMentee.partnerships))
            setLoadingGet(false);
        })();
    }


    async function chooseAMentor(mentorId) {
        setLoadingPost(true)

        const response = await fetch ('http://localhost:3001/api/mrs/mentee', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'mentee_id': localStorage.getItem('user_id'), 'mentor_id': mentorId, 'type': 'Accept'})
        })
        .then((response) => {
            if (response.status === 200) {
                localStorage.setItem('mentorStatus', 'Set');
                localStorage.setItem('mentorId', mentorId);
                props.deleteAlert(props.getAlerts);
                
                if (props.pageBool) {
                    document.getElementById('sidePageChevron').click()
                }

            }
            else {
                setError(true)
                setLoadingPost(false)
            }
            
        })
    }
        

    useEffect(() => {
        if (loadingGet) {
          loadUsers(localStorage.getItem('user_id'));
        }
    });

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    
    useEffect(() => {
        window.addEventListener("resize", sizeChange);
    })

    if (width >= height && height >= 500) {
        return (
            <>
            <ThemeProvider theme={theme}>
                <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    <Stack spacing={2}>
                        <Typography variant="h4" align='center'>Choose a Mentor</Typography>
                        <Typography variant='h5' align='center'>Choose who you want to mentor you or wait for more responses.</Typography>
                    </Stack>
                </Box>
                {(loadingGet || loadingPost) &&
                    <Box sx={{height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>}
                {!loadingGet && !loadingPost &&
                    <>
                        <Box sx={{px: (props.pageBool ? '5%' : '0')}}>
                        <VerticalFourBox title='Mentor Selection Page' components={
                            mentorStatus.map((elem, index) => {
                                const fullName = elem.first_name.concat(" ", elem.last_name);
                                    return <Grid key={index} container spacing={4}>
                                        <Grid item xs={9}>
                                            <Stack spacing={4}>
                                                <Grid container spacing={0} sx={{pt: '5%'}}>
                                                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <Typography>Name:</Typography>
                                                    </Grid>
                                                    <Grid item xs={8} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <StyleChip label={fullName}/>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={0}>
                                                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <Typography>Business Area:</Typography>
                                                    </Grid>
                                                    <Grid item xs={8} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <StyleChip label={elem.business}/>
                                                    </Grid>
                                                </Grid>
                                                <Grid container spacing={0}>
                                                    <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <Typography>Areas of Expertise:</Typography>
                                                    </Grid>
                                                    <Grid item xs={8} sx={{ display: 'flex', justifyContent: 'flex-start'}}>
                                                        <TagDisplay tags={elem.aoe}/>
                                                    </Grid>
                                                </Grid>
                                            </Stack>
                                        </Grid>
                                        <Grid item xs={3}>
                                            {elem.mentor_status === "Pending" && 
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}> 
                                                    <Typography textAlign={"center"}>The mentor has not yet responded.</Typography>
                                                </Box>}
                                            {elem.mentor_status === "Accept" && 
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}> 
                                                    <Button text="Accept" onClick={() => {chooseAMentor(elem.mentor)}}/>
                                                </Box>}
                                            
                                        </Grid>
                                    </Grid>
                            })
                        } />
                        </Box>
                    </>
                }
                {error &&
                    <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                }
            </ThemeProvider>
            </>
        )
    }
    else {
        return (
            <>
            <Box sx={{display: 'flex',justifyContent: 'center'}}>
                <Typography variant='h5'>Choose who you want to mentor you or wait for more responses.</Typography>
            </Box>
            <VerticalFourBox title='Mentor Selection Page' components={
                mentorStatus.map((elem, index) => {
                    const fullName = elem.first_name.concat(" ", elem.last_name);
                    return (
                        <Stack spacing={2} key={index}>      
                            <Typography>Name:</Typography>                                       
                            <StyleChip label={fullName}/>                                      
                            <Typography>Business Area:</Typography>                                       
                            <StyleChip label={elem.business}/>                                       
                            <Typography>Areas of Expertise:</Typography>                                       
                            <TagDisplay tags={elem.aoe}/>
                            {elem.mentor_status === "Pending" && 
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}> 
                                    <Typography textAlign={"center"}>The mentor has not yet responded.</Typography>
                                </Box>
                            }
                            {elem.mentor_status === "Accept" && 
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}> 
                                    <Button buttonClass={props.pageBool ? "SidePageButton" : ""} onClick={() => {chooseAMentor(elem.mentor); props.deleteAlert(props.getAlerts)}} text="Accept"/>
                                </Box>
                            }
                        </Stack>
                    )
                })
            } />
            </>
        )
    }
}

export default MentorSelectionPage;