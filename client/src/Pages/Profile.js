import React, {  useState, useEffect } from 'react';
import { Typography, Grid, Card } from '@mui/material';
import TitleButton from '../Components/TitleButtons';

function Profile(){
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
        

    useEffect(() => {
        window.addEventListener("resize", sizeChange);
    })

    
    if (width >= height && height >= 500 && width >= 800) {
        return (
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>Profile</Typography>
            <Grid container spacing={{xs: 2, sm: 4, md: 8, lg: 12, xl: 24}} sx={{height: '100%', justifyContent: 'center'}}>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="Schedule >" id="Schedule" height="30vh" variant="h4" align="center"/></Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="Milestones >" id="Milestones" height="30vh" variant="h4" align="center"/></Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="Past Meetings >" id="Past Meetings" height="30vh" variant="h4" align="center"/></Card>
                </Grid>
            </Grid>
            <Grid container spacing={{xs: 2, sm: 4, md: 8, lg: 12, xl: 24}} sx={{ pt: '10vh', height: '100%', justifyContent: 'center'}}>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="Account Settings >" id="Account Settings" height="30vh" variant="h4" align="center"/></Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="System Settings >" id="System Settings" height="30vh" variant={"h4"} align="center"/></Card>
                </Grid>
                <Grid item xs={4}>
                <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}><TitleButton title="Contact Us >" id="Contact Us" height="30vh" variant="h4" align="center"/></Card>
                </Grid>
            </Grid>
            </>
        )
    }
    else {
        return(
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {xs: 24, sm: 34}}}>Profile</Typography>
            <Grid container spacing={2} sx={{ pb: '5%'}}>
            <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="Schedule >" id="Schedule" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
                <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="Milestones >" id="Milestones" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
                <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="Past Meetings >" id="Past Meetings" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
                <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="Account Settings >" id="Account Settings" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
                <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="System Settings >" id="System Settings" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
                <Grid item xs={12}>
                <Card elevation={3} sx={{width: '100%', height: '15vh', borderRadius: "20px"}}><TitleButton title="Contact Us >" id="Contact Us" height="15vh" variant="h5" align="center"/></Card>
                </Grid>
            </Grid>
            </>
        )
    }    
}

export default Profile;