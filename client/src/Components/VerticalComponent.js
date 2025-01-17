import React from 'react';
import {Grid, Card, Container, Typography, Box} from '@mui/material';
import '@fontsource/roboto/300.css';


function VerticalComponent(props) {

    return (
        <>       
        <Card elevation={0} sx={{width: '100%', height: '90%', borderRadius: "20px", overflowY:'auto'}}>
            <Grid container direction="column" justifyContent="space-around" alignItems="center" sx={{pb: 7, pl: 2, pr: 2}}>
                {props.components.map((elem, index) => {
                return <Grid key={index} container direction="column" justifyContent="space-around" alignItems="center" sx={{pt: 1, pb: 1}}>
                    <Card elevation={1} style={{backgroundColor: '#000078'}} sx={{display: 'flex', alignItems: 'center', width: '95%', minHeight:'60px', height: 'auto', borderRadius: "20px"}}>
                        <Container sx={{py: '2.5vh'}}>
                            {(elem)}
                        </Container>
                    </Card> 
                </Grid>;
                })}
            </Grid>
            {props.components.length === 0 &&
                <Typography align='center' sx={{color: '#000078', fontStyle: '300'}}>Your schedule is empty</Typography>
            }
        </Card>
        </>
    )
}

export default VerticalComponent;