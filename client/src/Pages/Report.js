import React from 'react';
import { Typography, TextField, Container, Stack, Card, CircularProgress, Box } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import Button from '../Components/Button';
import Theme  from '../Components/Theme';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

function Report() {
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(false)
    const [submitted, setSubmitted] = React.useState(false)

    const CHARACTER_LIMIT = 1000;
    const [valuesChars, setValuesChars] = React.useState({report: ""});

    const handleChange = report => event => {
        setValuesChars({ ...valuesChars, [report]: event.target.value });
    };

    async function reportEndpoint() {
        setLoading(true)
        setError(false)
        const response = await fetch ('http://localhost:3001/api/reports', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id : localStorage.getItem('user_id'),
                report : valuesChars.report,
            })
        }).then((response) => {
            setLoading(false)
            if (response.status === 200) {
                setSubmitted(true)
            }
            else {
                setError(true)
            }
            
        })
    }

    return (
        <ThemeProvider theme={Theme}>
            {!submitted && 
                <Card elevation={0} alignItems='center' justifyContent='center' sx={{pt: '1%', pb: '12%', height: '100%', width: '100%', overflowY: 'auto'}}>
                    <Container padding={2}>
                        <Stack spacing={4} alignItems='center' sx={{pt: '3vh'}}>
                            <Typography align='center'>If you need to report something, please submit a message below. HR will read your message and be able to contact you via email.</Typography>  
                            <TextField label='Your Report' multiline rows = {8} inputProps={{maxlength: CHARACTER_LIMIT}} valueChar={valuesChars.report} helperText={`${valuesChars.report.length}/${CHARACTER_LIMIT}`} onChange={handleChange("report")} placeholder='Type your message here.' variant='outlined' fullWidth required/>
                            <Button onClick={() => {reportEndpoint()}} text={"Submit"}></Button>
                        </Stack>
                    </Container> 
                 </Card>
            }
            {submitted && 
                 <Container padding={2}>
                    <Stack spacing={4} alignItems='center' sx={{pt: '3vh'}}>
                        <Typography variant='h5'>Thanks for your report. HR will be in touch shortly.</Typography>
                        <Button onClick={() => {setSubmitted(false)}} text={"Send Another Report"}></Button>
                    </Stack>
                </Container>
            }
            {loading &&
                <Box sx={{height: '20vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                    <StyleCircularProgress/>
                </Box>
            }
            {error &&
                <Typography align='center' variant='h5' color='error'>Something went wrong. Please try again.</Typography>
            }
        </ThemeProvider>
    );
}

export default Report;