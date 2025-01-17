import React, { useEffect } from 'react';
import {Typography, MobileStepper, Button, Container, Box, Grid} from '@mui/material';
import '@fontsource/roboto/300.css';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import Slide from '@mui/material/Slide';

/*
    activeStep tracks the current step of the horizontal component.
    goLeft is a state used by the slide transitions. So is changePage.
    Max steps is used by the mobile stepper to prevent the active step going too high.
    the useStyles const modifies the colour and size of the mobile stepper dots to make them better fit the application aesthetic. dot is when the step is not Active is when it is.
*/ 

function HorizontalCarousel(props) {
    const [activeStep, setActiveStep] = React.useState(0); 
    const [goLeft, setGoLeft] = React.useState(0);
    const [changePage, setChangePage] = React.useState(1);
    const maxSteps = props.components.length;
    const theme = useTheme();

    useEffect(() => {
        if (activeStep >= maxSteps && maxSteps !== 0) {
            setActiveStep(activeStep - 1)
        }
    })

    const handleNext = () => {
        {activeStep === maxSteps - 1 ? (setActiveStep((prevActiveStep) => prevActiveStep - maxSteps + 1)) : (setActiveStep((prevActiveStep) => prevActiveStep + 1))};
        setGoLeft(1);
        setChangePage(1);
    };
    
    const handleBack = () => {
        {activeStep === 0 ? (setActiveStep((prevActiveStep) => prevActiveStep + maxSteps - 1)) : (setActiveStep((prevActiveStep) => prevActiveStep - 1))};
        setGoLeft(0);
        setChangePage(1);
    };

    const useStyles = makeStyles({
        dot : {
            backgroundColor: '#5743DB',
            opacity: 0.25,
            height : '1.4vh',
            width: '1.4vh'
        },
        dotActive: {
            backgroundColor: "#5743DB",
            opacity: 1.0,
            height : '1.7vh',
            width: '1.7vh'
        }
    });

    /*
        The mobile stepper controls the navigation of the horizontal carousel.
        The box underneath holds the content of the carousel.
    */

    const dotColour = useStyles();
    if (maxSteps > 0) {
        return (
            <>
            <Container sx={{ height: 'auto'}}>
                <MobileStepper variant = "dots" classes={{dot: dotColour.dot, dotActive: dotColour.dotActive}} steps={maxSteps > 3 ? 3 : maxSteps} position="static" activeStep={activeStep === 0 ? 0 : (activeStep === (maxSteps - 1) && maxSteps >= 3 ? 2 : 1)}
                    nextButton={<Button size="small" onClick={() => {setGoLeft(0); setChangePage(0)}} disabled={maxSteps === 1} sx={{height:'1vh', weight:'1vh', color: [maxSteps === 1 ? 'grey' : '#5743DB']}}>
                        {theme.direction === 'rtl' ? (
                        <ChevronLeftIcon />
                        ) : (
                        <ChevronRightIcon />
                        )}
                    </Button>}
                    backButton={<Button size="small" onClick={() => {setGoLeft(1); setChangePage(0)}} disabled={maxSteps === 1} sx={{height:'1vh', weight:'1vh', color: [maxSteps === 1 ? 'grey' : '#5743DB']}}>
                        {theme.direction === 'rtl' ? (
                        <ChevronRightIcon />
                        ) : (
                        <ChevronLeftIcon />
                        )}
                    </Button>}
                />
                 </Container>
                <Grid item xs={12}>
                <Box sx={{ height: 'auto', px: '5%'}}>
                    <Slide appear={false} in={changePage === 1} onExited={goLeft === 0 ? handleNext : handleBack} direction={goLeft === 1 ? "left" : "right" }>
                        <span>
                            {props.components[activeStep]}   
                        </span>
                    </Slide>
                </Box>
                </Grid>
      
        </>
        )
    }
    else {
        return (
            <Typography variant='h6' textAlign='center' sx={{pt: '10%'}}>You have no {props.title}</Typography>
        )
    }
}

export default HorizontalCarousel;