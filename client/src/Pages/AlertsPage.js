import React from 'react';
import {Grid} from '@mui/material';
import HorizontalCarousel from '../Components/HorizontalCarousel';
import AlertProcessor from '../Utility/AlertProcessor';

/*
 Displays the alerts in a horizontal carousel.
 uses the alert processor to display the info.
*/

export default function AlertsPage(props) {
    return (
        <Grid sx={{pb:'3%'}}>
        <HorizontalCarousel title='Alerts' components={
            props.getAlerts.map((elem, index) => { 
                return <AlertProcessor key={index} type="full" getAlerts={props.getAlerts[index]} deleteAlert={props.deleteAlert}/>
            })
        }/>
        </Grid>
    )
}