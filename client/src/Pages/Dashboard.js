import React, {  useState, useEffect } from 'react';
import { Grid, Typography, Card, CircularProgress, Box, Stack } from '@mui/material';
import TitleButton from '../Components/TitleButtons';
import Tab from '../Components/Tab';
import '@fontsource/roboto/300.css';
import HorizontalCarousel from "../Components/HorizontalCarousel";
import MentorTab from './MentorTab';
import MenteeTab from './MenteeTab';
import VerticalComponent from "../Components/VerticalComponent";
import TimeSelector from '../Components/TimeSelector';
import AlertProcessor from '../Utility/AlertProcessor';
import { withStyles } from '@mui/styles';
const key = require('../api-key.json')


const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

function Dashboard(props){
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [isMentor, setIsMentor] = useState(localStorage.getItem('isMentor') === 'true');
    const [schedule, setSchedule] = useState([])
    const [milestones, setMilestones] = useState([]);
    const [loadingMilestones, setLoadingMilestones] = useState(true)
    const [loadingSchedule, setLoadingSchedule] = useState(true)

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    function getSchedule() {
        (async () => {
            var userID = localStorage.getItem('user_id');
            const response = await fetch ('http://localhost:3001/api/scheduler/getSchedule', {
                method: 'POST',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userID: userID})
            })
            if (response.status === 401) {
                props.setToken(false); 
                window.location.reload(); 
                localStorage.clear()
            }
            const giveSchedule = await response.json();
            setSchedule(giveSchedule);
            setLoadingSchedule(false)
        })();
    }

    function loadUser() {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/milestones/' + localStorage.getItem('user_id'), {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const givenMilestones = await response.json();
            setMilestones(givenMilestones)
            setLoadingMilestones(false);
        })();
      }

        

    useEffect(() => {
        window.addEventListener("resize", sizeChange);
        setIsMentor(localStorage.getItem('isMentor') === 'true');
        if (loadingMilestones) {
            loadUser();
        }
        if (loadingSchedule) {
            getSchedule();
        }
    })

    const mentoringTabContentArray = [
        <MentorTab
            height={height}
            width={width}
            hasMentor={localStorage.getItem('mentorStatus')} 
        />, 
        <MenteeTab/>
    ]

    
    if (width >= height && height >= 500) {
        return (
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>Dashboard</Typography>
            <Grid container spacing={{xs: 2, sm: 4, md: 6, lg: 8, xl: 12}} sx={{height: 'auto'}}>
                <Grid item xs={8}>
                    <Card elevation={6} sx={{width: '100%', height: '40vh', borderRadius: "20px", mb: '5vh', overflowY: 'auto'}}>
                        <Tab tabSubjects={isMentor ? ["Mentee", "Mentor"] : ["Mentor", "Mentee"]} tabObjects={isMentor ? mentoringTabContentArray.reverse() : mentoringTabContentArray}/>
                    </Card>
                    <Grid container spacing={{xs: 2, sm: 2, md: 4, lg: 6, xl: 8}}>
                        <Grid item xs={6}>
                            <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px"}}>
                                <TitleButton title="Milestones >" align="start" variant="h5" id="Milestones"/>
                                    {!loadingMilestones &&
                                        <HorizontalCarousel title='Milestones' components={
                                            milestones.map((elem, index) => { 
                                                return (
                                                    <Typography component={'span'} sx={{color: '#000078', fontStyle:"300", fontSize: {xs: 14, sm: 16, md: 20, lg: 20, xl: 20}}}>{elem.title}</Typography>
                                                )
                                            })
                                        }/>
                                    }
                                    {loadingMilestones && 
                                        <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                            <StyleCircularProgress/>
                                        </Box>
                                    }
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card elevation={3} sx={{width: '100%', height: '30vh', borderRadius: "20px" }}>
                                <TitleButton title="Alerts >" align="start" variant="h5" id="Alerts"/>
                                <HorizontalCarousel title='Alerts' components={
                                    props.getAlerts.map((elem, index) => { 
                                        return <AlertProcessor key={index} type="minimised" getAlerts={props.getAlerts[index]}/>
                                    })
                                }/>
                            </Card>
                        </Grid>
                    </Grid>
                    
                </Grid>
                <Grid item xs={4}>
                    <Card elevation={4} sx={{width: '100%', height: '75vh', borderRadius: "20px"}}>
                        <TitleButton title="Schedule >" align="start" variant="h5" id="Schedule"/>
                            {!loadingSchedule &&
                                <VerticalComponent components={
                                    schedule.map((elem, index) => {
                                        var datetime = new Date(elem.date)
                                        var dateString = datetime.toLocaleDateString()
                                        var timeString = datetime.toLocaleTimeString()
                                        timeString = timeString.slice(0, 5)
                                        return (
                                            <Stack spacing={0.5}>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 14, sm: 14, md: 16, lg: 16, xl: 16}}}>{elem.Name}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{timeString + " - " + dateString}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{elem.location}</Typography>
                                            </Stack>
                                        )
                                    })
                                }/>
                            }
                            {loadingSchedule && 
                                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                    <StyleCircularProgress/>
                                </Box>
                            }
                    </Card>
                </Grid>
            </Grid>
            </>
        )
    }
    else if (height >= 500) {
        return(
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {xs: 24, sm: 34}}}>Dashboard</Typography>
            <Grid container spacing={{xs: 2, sm: 4}} sx={{ pb: '5%'}}>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '40vh', borderRadius: "20px", overflowY: 'auto'}}>
                        <Tab tabSubjects={isMentor ? ["Mentee", "Mentor"] : ["Mentor", "Mentee"]} tabObjects={isMentor ? mentoringTabContentArray.reverse() : mentoringTabContentArray}/>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '50vh', borderRadius: "20px"}}><TitleButton title="Schedule >" align="start" variant="h5"/>
                        {!loadingSchedule &&
                                <VerticalComponent components={
                                    schedule.map((elem, index) => {
                                        var datetime = new Date(elem.date)
                                        var dateString = datetime.toLocaleDateString()
                                        var timeString = datetime.toLocaleTimeString()
                                        timeString = timeString.slice(0, 5)
                                        return (
                                            <Stack spacing={0.5}>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 14, sm: 14, md: 16, lg: 16, xl: 16}}}>{elem.Name}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{dateString}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{timeString}</Typography>
                                            </Stack>
                                        )
                                    })
                                }/>
                            }
                            {loadingSchedule && 
                                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                    <StyleCircularProgress/>
                                </Box>
                            }
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '10vh', borderRadius: "20px"}}><TitleButton height='10vh' title="Alerts >" align="start" variant="h5"/></Card>
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '10vh', borderRadius: "20px"}}><TitleButton height='10vh' title="Plan of Action >" align="start" variant="h5"/></Card>
                </Grid>
            </Grid>
            </>
        )
    }
    else {
        return(
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {xs: 24, sm: 34}}}>Dashboard</Typography>
            <Grid container spacing={{xs: 1, sm: 3}} sx={{ pb: '5%'}}>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '65vh', borderRadius: "20px", overflowY: 'auto'}}> <Tab tabSubjects={isMentor ? ["Mentee", "Mentor"] : ["Mentor", "Mentee"]} tabObjects={isMentor ? mentoringTabContentArray.reverse() : mentoringTabContentArray}/></Card>
                </Grid>
                 <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '70vh', borderRadius: "20px"}}><TitleButton title="Schedule >" align="start" variant="h5"/>
                        {!loadingSchedule &&
                                <VerticalComponent components={
                                    schedule.map((elem, index) => {
                                        var datetime = new Date(elem.date)
                                        var dateString = datetime.toLocaleDateString()
                                        var timeString = datetime.toLocaleTimeString()
                                        timeString = timeString.slice(0, 5)
                                        return (
                                            <Stack spacing={0.5}>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 14, sm: 14, md: 16, lg: 16, xl: 16}}}>{elem.Name}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{dateString}</Typography>
                                                <Typography component={'span'} sx={{color: 'white', fontStyle:"300", fontSize: {xs: 12, sm: 12, md: 14, lg: 14, xl: 14}}}>{timeString}</Typography>
                                            </Stack>
                                        )
                                    })
                                }/>
                            }
                            {loadingSchedule && 
                                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                    <StyleCircularProgress/>
                                </Box>
                            }
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '10vw', borderRadius: "20px"}}><TitleButton height='10vw' title="Alerts >" align="start" variant="h5"/></Card>
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '10vw', borderRadius: "20px"}}><TitleButton height='10vw' title="Plan of Action >" align="start" variant="h5"/></Card>
                </Grid>
            </Grid>
            </>
        )
    }    
}

export default Dashboard;