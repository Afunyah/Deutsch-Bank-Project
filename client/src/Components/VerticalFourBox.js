import React from 'react';
import { Grid, Box,  Card, Stack, Typography } from '@mui/material';
import '@fontsource/roboto/300.css';


function VerticalFourBox(props){
    return (
        <>
        <Card elevation={0} sx={{mt: '2.5vh', px: '2.5vh', width: '100%', height: '50vh', borderRadius: "20px", overflowY:'auto' }}>
            <Stack alignItems="center">
                {props.components.map((elem, index) => {
                    if (elem === null) {
                        return (
                            <></>
                        )
                    }
                    return <Grid container key={index} direction="column" justifyContent="space-around" alignItems="center">
                        <Box sx={{width:'100%', borderTop:2, borderBottom: (index === props.components.length - 1 ? 2 : 0), borderColor: "#5743DB", pt: 0.5, pb: 1, pl: 1, pr: 1, overflow: 'hidden'}}>
                            {elem}
                        </Box>
                    </Grid>;
                })}
            </Stack>
            {props.components.length === 0 &&
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                    {props.title === "Booked" &&
                        <Typography align='center'>You haven't booked any workshops.</Typography>
                    }
                    {props.title === "Upcoming" &&
                        <Typography align='center'>There are no upcoming workshops.</Typography>
                    }
                </Box>
            }
        </Card>
        </>
    )    
}

export default VerticalFourBox;