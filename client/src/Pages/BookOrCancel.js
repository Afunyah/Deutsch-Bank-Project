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
    const [workshop, setWorkshop] = useState();
    const [loadingGet, setLoadingGet] = useState(true);
    const [loadingPost, setLoadingPost] = useState(false);
    const [error, setError] = useState(false);

    function loadWorkshop() {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/workshops/' + localStorage.getItem('selectedWorkshop'), {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const givenWorkshop = await response.json();
            setWorkshop(givenWorkshop);
            setLoadingGet(false);
        })();
      }
    
      useEffect(() => {
        if (loadingGet) {
            loadWorkshop();
        }
      });

    async function updateSystemWithResponse() {
        setLoadingPost(true)
        setError(false)

        await fetch ((props.page === "Book" ? 'http://localhost:3001/api/workshops/bookAWorkshop' : 'http://localhost:3001/api/workshops/unbookAWorkshop'), {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'menteeID': localStorage.getItem('user_id'), 'workshopID': localStorage.getItem('selectedWorkshop')})
        })
        .then((response) => {
            if (response.status === 200) {
                document.getElementById('sidePageChevron').click()
            }
            else {
                setError(true)
                setLoadingPost(false)
            }
            
        })
    }
    
    return (
        <>
            <Stack spacing={{xs: 2, sm: 2, md: 4, lg: 4, xl: 4}} sx={{pb:'3%'}}>
                <Typography variant="h4" textAlign={"center"}>{(props.page === "Book" ? "Book a Workshop" : "Cancel Workshop Booking")}</Typography>
                <Typography variant="h5" textAlign={"center"}>{(props.page === "Book" ? "Would you like to book a spot at this workshop?" : "Would you like to cancel your workshop booking?")}</Typography>
                {(loadingGet || loadingPost) &&
                    <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <StyleCircularProgress/>
                    </Box>
                }
                {!loadingGet && !loadingPost &&
                    <>    
                        <Grid container spacing={0}>
                            <Grid item xs={3}/>
                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <Typography>Workshop Name:</Typography>
                            </Grid>
                            <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                <StyleChip label={workshop.Name}/>
                            </Grid>
                            <Grid item xs={3}/>
                        </Grid>
                        {props.page === "Book" &&
                            <>
                            <Grid container spacing={0}>
                                <Grid item xs={3}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <Typography>Date</Typography>
                                </Grid>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <StyleChip label={new Date(workshop.Details.StartDateTime).toLocaleDateString()}/>
                                </Grid>
                                <Grid item xs={3}/>
                            </Grid>
                            <Grid container spacing={0}>
                                <Grid item xs={3}/>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <Typography>Time:</Typography>
                                </Grid>
                                <Grid item xs={3} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                    <StyleChip label={new Date(workshop.Details.StartDateTime).toLocaleTimeString()}/>
                                </Grid>
                                <Grid item xs={3}/>
                            </Grid>
                            </>
                        }
                        <Grid container spacing={0}>
                            <Grid item xs={2}/>
                            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                <Button text={(props.page === "Book" ? "Book Workshop" : "Cancel Booking")} onClick={() => {updateSystemWithResponse()}} color={(props.page === "Book" ? undefined : 1)}></Button>
                            </Grid>
                            <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center'}}>
                                <Button text="Back" buttonClass="SidePageButton" color={(props.page === "Book" ? 1 : undefined)}></Button>
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

export default MenteeApprovalPage;