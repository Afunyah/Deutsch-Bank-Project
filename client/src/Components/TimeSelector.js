import * as React from 'react';
import Button from "./Button.js";
import { Grid } from '@mui/material'

/* 
    the onclick changes the colour of the button on press and updates the state in the parent functonal component.
*/

function TimeSelector(props) {
    const [picked, setPicked] = React.useState();

    return (
        <Grid container spacing={2} alignItems='center' justifyContent='center'>
            {props.times.map((time, index) => <Grid item key={index}>
                <Button text={time} onClick={() => {props.buttonState(index); (picked === index ? setPicked() : setPicked(index))}} color={index === picked ? undefined : 1}></Button>
            </Grid>)}
        </Grid>
    );
}

export default TimeSelector;