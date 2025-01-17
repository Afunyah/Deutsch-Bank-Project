import React from 'react';
import { Typography, Container, Stack, TextField } from '@mui/material';
import Tab from '../Components/Tab';
import AppFeedback from './AppFeedback';
import Report from './Report';

function ContactUs() {
    return (
        <Container alignItems='center' justifyContent='center' sx={{height: '85%', width: '100%'}}>
            <Tab 
                tabSubjects={["Report", "App"]} 
                tabObjects={[<Report></Report>, <AppFeedback></AppFeedback>]}
            />
        </Container>
    )
}

export default ContactUs;