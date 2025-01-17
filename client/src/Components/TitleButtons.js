import * as React from 'react';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

export default function TitleButton(props) {
    return(
        <span className='SidePageButton' id={props.id}>
        <Button sx={{width: '100%', height: props.height, textTransform: 'none', justifyContent: props.align}}>
            <Typography sx={{ p: '2.5%', fontStyle: '300',fontSize: {xs: 16, sm: 16, md: 20, lg: 24, xl: 34}, color: '#000078'}}>{props.title}</Typography>
        </Button>
        </span>
    )
}