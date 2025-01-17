import React from 'react';
import { Typography, Container, Grid, Box, Stack, CircularProgress } from '@mui/material'; 
import Button from '../Components/Button.js';
import TagSelector from '../Components/TagSelector.js';
import TagSelectorToBinaryArray from '../Utility/TagSelectorToBinaryArray';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json');


const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

function RequestMentor(props) {
    const [selected, setSelected] = React.useState([]);
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    function changeSelected(newTagArray) {
        setSelected(newTagArray); 
    }

    
    async function TriggerScattershot(tagArray) {
        var userID = localStorage.getItem('user_id');
        var businessArea = localStorage.getItem('business');
        setLoading(true)
        setError(false)

        fetch ('http://localhost:3001/api/mrs/recommend', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({'id': userID, 'business': businessArea, 'tags': TagSelectorToBinaryArray(tagArray, true)})
        })
            .then((response) => {
                if (response.status === 200) {
                    localStorage.setItem('mentorStatus', 'Awaiting Mentors')
                    document.getElementById('sidePageChevron').click()

                }
                else {
                    setError(true)
                    setLoading(false)
                }
                
            })
            
    }

    return (
        <Container padding={2} sx={{pb:'3%'}}>
                <Stack spacing={4}>
                <Typography align='center' variant='h4'>Requesting a Mentor</Typography>
                <Typography align='center' variant='h5'>Select the areas you would like to develop professionally.</Typography>
                    {!loading && 
                        <>
                        <Grid container spacing={1} alignItems='center' justifyContent='center'>
                            <Grid item xs={2}/>
                            <Grid item xs={8}>
                            <TagSelector stateFunction={changeSelected} startingTags={[]}/>
                            </Grid>
                            <Grid item xs={2}/>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent:'center'}}>
                            <Button text='Find Mentors' onClick={() => {TriggerScattershot(selected)}}/>
                        </Box>
                        </>
                    }
                    {loading &&
                        <Box sx={{width: '100%', height: '20vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <StyleCircularProgress/>
                        </Box>
                    }
                    {error &&
                        <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
                    }
                </Stack>
        </Container>    
    );
}

export default RequestMentor;