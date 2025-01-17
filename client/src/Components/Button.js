import * as React from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';


/*
    This component is a styled button that means buttons across the application are consistent.
    onClick is a function passed in that gives the button something to do once it is clicked.
    id is mainly for sidepagebutton and just sets the id of the button. 
    buttonClass has to happen on the span because the Material UI button component already has a class.
    props.color is a prop passed to either produce a white button with purple outline or purple button. The prop is not defined for the default button and set to any value for the white one.
*/

function MyButton(props) {
    return (
        <span className={props.buttonClass} id={props.buttonId}>
            <Button variant="contained" onClick={props.onClick} id={props.id} disabled={props.disabled === undefined ? false : props.disabled} sx={{borderRadius: "50px", opacity: props.opacity, textTransform: 'none', outline: (props.color === undefined ? 0 : '#5743DB solid 1px'),  color: (props.color === undefined ? 'white': '#5743DB'), backgroundColor: (props.color === undefined ? '#5743DB': 'white'), width: props.width, '&:hover': {backgroundColor: (props.color === undefined ? '#0018A8': '#b5abf5')} }}>
                <Typography sx={{ fontStyle: '300', fontSize: {xs: 14, sm: 14, md: 16, lg: 20, xl: 20}}}>{props.text}</Typography>
            </Button>
        </span>
    )
}

export default MyButton;