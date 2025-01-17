import React, { useState, useEffect } from 'react';
import { Typography, Container, Stack, Box, CircularProgress, TextField } from '@mui/material';
import Tab from '../Components/Tab';
import HorizontalCarousel from '../Components/HorizontalCarousel';
import Button from '../Components/Button';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

const warnings = [
    {
        firstName: "Bellatrix",
        lastName: "Lestrange",
        email: "BLestrange@hogwarts.ac.uk",
        reason: "rejected 3 or more meetings",
        date_created: "2022-03-02T12:56:32.518Z",
        numberOfWarnings: 5
    },
    {
        firstName: "Molly",
        lastName: "Weasley",
        email: "MWeasley@hogwarts.ac.uk",
        reason: "recieved a low rating",
        date_created: "2022-03-04T15:16:25.518Z",
        numberOfWarnings: 1
    },
    {
        firstName: "Sybill",
        lastName: "Trelawney",
        email: "STrelawney@hogwarts.ac.uk",
        reason: "ignored an alert for more than a week",
        date_created: "2022-03-06T19:34:21.518Z",
        numberOfWarnings: 2
    }
]

function AdminPanel() {
    const [reports, setReports] = useState([]);
    const [appFeedback, setAppFeedback] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loadingReports, setLoadingReports] = useState(true);
    const [loadingAppFeedback, setLoadingAppFeedback] = useState(true);
    const [loadingIsAdmin, setLoadingIsAdmin] = useState(true);

    function loadReports() {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/reports', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const givenReports = await response.json();
            setReports(givenReports);
            setLoadingReports(false);
        })();
    }

    function loadAppFeedback() {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/appfeedback', {
                method: 'GET',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const givenAppFeedback = await response.json();
            setAppFeedback(givenAppFeedback);
            setLoadingAppFeedback(false);
        })();
    }

    function checkIsAdmin() {
        (async () => {
            const response = await fetch ('http://localhost:3001/api/user/' + localStorage.getItem("user_id"), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "api-key": key['key']
                }
            })
            const userInfo = await response.json();
            setIsAdmin(userInfo.isAdmin);
            setLoadingIsAdmin(false);
        })();
    }

    useEffect(() => {
        if (loadingIsAdmin)
            checkIsAdmin();
        if (loadingAppFeedback)
            loadAppFeedback();
        if (loadingReports)
            loadReports();
    })

    return (

        <Container alignItems='center' justifyContent='center' sx={{height: '85%', width: '100%'}}>
            {loadingIsAdmin && 
                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                    <StyleCircularProgress/>
                </Box>
            }
            {!loadingIsAdmin && isAdmin &&
                <Tab 
                    tabSubjects={["Warnings", "Reports", "Developer"]} tabObjects={[
                        <Container>
                            <HorizontalCarousel title="warnings to process" components={
                                warnings.map((elem, index) => {
                                    var date = new Date(elem.date_created).toLocaleDateString()
                                    var time = new Date(elem.date_created).toLocaleTimeString()
                                    return (
                                        <Stack spacing={2} alignItems="center">
                                            <Typography variant="h6">As of {date} at {time}, {elem.firstName} {elem.lastName} has {elem.reason}.</Typography>
                                            <Typography variant="h6">{elem.firstName} has received {elem.numberOfWarnings} warning{elem.numberOfWarnings !== 1 && "s"} so far.</Typography>
                                            <Typography variant="h6">Email {elem.firstName}: {elem.email}</Typography>
                                            <Button buttonId="Resolved" text="Resolved"/>
                                        </Stack>
                                    );
                                })
                            }></HorizontalCarousel>
                        </Container>,

                        <Container>
                            {loadingReports && 
                                <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                    <StyleCircularProgress/>
                                </Box>
                            }
                            {!loadingReports &&
                                <HorizontalCarousel title="reports to process" components={
                                    reports.map((elem) => {
                                        var date = new Date(elem.date_created).toLocaleDateString()
                                        var time = new Date(elem.date_created).toLocaleTimeString()
                                        return (
                                            <Stack spacing={2} alignItems="center">
                                                <Typography variant="h6">On {date} at {time}, {elem.user_id.first_name} {elem.user_id.last_name} made the following report:</Typography>
                                                <Typography minWidth="100%" minHeight="16vh" maxHeight="16vh" overflow="auto" padding={2} backgroundColor='#EEEEEE' variant="h6">{elem.report}</Typography>
                                                <Typography variant="h6">Email {elem.user_id.first_name}: {elem.user_id.email}</Typography>
                                                <Button buttonId="Resolved" text="Resolved"/>
                                            </Stack>
                                        );
                                    })
                                }></HorizontalCarousel>
                            }
                        </Container>,

                        <Container>
                            <Stack spacing={10} alignItems="center">
                                {loadingAppFeedback && 
                                    <Box sx={{pt: '5%', display: 'flex', justifyContent: 'center'}}>
                                        <StyleCircularProgress/>
                                    </Box>
                                }
                                {!loadingAppFeedback &&
                                    <HorizontalCarousel title="feedback to process" components={
                                        appFeedback.map(elem => {
                                            var date = new Date(elem.date_created).toLocaleDateString()
                                            var time = new Date(elem.date_created).toLocaleTimeString()
                                            return (
                                                <Stack spacing={2} alignItems="center">
                                                    <Typography variant="h6">On {date} at {time}, {elem.user_id.first_name} {elem.user_id.last_name} submitted the following app feedback:</Typography>
                                                    <Typography minWidth="100%" minHeight="16vh" maxHeight="16vh" overflow="auto" padding={2} backgroundColor='#EEEEEE' variant="h6">{elem.feedback}</Typography>
                                                    <Typography variant="h6">Email {elem.user_id.first_name}: {elem.user_id.email}</Typography>
                                                    <Button buttonId="Resolved" text="Resolved"/>
                                                </Stack>
                                            );
                                        })
                                    }></HorizontalCarousel>
                                }
                                <form onSubmit={() => {alert('Added tag!');}}>
                                    <Stack spacing={2} alignItems="center">
                                        <TextField label='Add new tag to system' variant='outlined' fullWidth required/>
                                        <Button buttonId="Resolved" text="Submit"/>
                                    </Stack>
                                </form>
                            </Stack>
                        </Container>
                    ]
                    }/>
                }
                {!loadingIsAdmin && !isAdmin &&
                    <Typography align='center' variant='h5' color='error'>You do not have permission to view this page.</Typography>
                }
            </Container>
    );
}
    

export default AdminPanel;