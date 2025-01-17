import React from 'react';
import { Typography, TextField, Container, Stack, Card, CircularProgress, Box } from '@mui/material';
import Button from '../Components/Button';
import { ThemeProvider } from '@emotion/react';
import Theme  from '../Components/Theme';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { withStyles } from '@mui/styles';

const key = require('../api-key.json')

const labels = {
    null: '',
    0.5: 'Useless',
    1: 'Useless',
    1.5: 'Poor',
    2: 'Poor',
    2.5: 'Ok',
    3: 'Ok',
    3.5: 'Good',
    4: 'Good',
    4.5: 'Excellent',
    5: 'Excellent',
  };

const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

function Feedback(props) {
    const [value, setValue] = React.useState(2.5);
    const [hover, setHover] = React.useState(-1);
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(false)

    const CHARACTER_LIMIT = 1000;
    const [valuesChars, setValuesChars] = React.useState({feedback: ""});


    const handleChange = feedback => event => {
        setValuesChars({ ...valuesChars, [feedback]: event.target.value });
    };

    async function feedbackEndpoint() {
        setLoading(true)
        setError(false)
        const response = await fetch ('http://localhost:3001/api/feedback', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                star_rating: value,
                given_by : props.getAlerts.user_associated,
                given_to : props.getAlerts.sender,
                feedback_body : valuesChars.feedback,
                partnershipId : (props.getAlerts.details.partnershipId === undefined ? false : props.getAlerts.details.partnershipId),
                workshopId : (props.getAlerts.details.workshopId === undefined ? false : props.getAlerts.details.workshopId)
            })
        }).then((response) => {
            if (response.status === 200) {
                props.deleteAlert(props.getAlerts)
            }
            else {
                setError(true)
                setLoading(false)
            }
            
        })
    }
    
    return (
        <ThemeProvider theme={Theme}>
            {props.getAlerts.type === 7 &&
                <Typography variant="h4" align='center'>Give feedback to your mentoring partner</Typography>
            }  
            {props.getAlerts.type === 8 &&
                <Typography variant="h4" align='center'>Give feedback about the workshop you recently attended</Typography>
            } 
            {!loading &&
                <Card elevation={0} alignItems='center' justifyContent='center' sx={{pt: '2%', pb: '8%', height: '100%', width: '100%', overflowY: 'auto'}}>
                    <Container padding={2}>
                        <Stack spacing={0.5} alignItems='center'>
                               <div/>
                               <div/>
                               <div/>
                               <div/>
                               <div/>
                               <div/>
                            <Typography>Rate Pairing:</Typography>  
                            <Rating name="hover-feedback" size="large" value={value} precision={0.5} onChange={(event, newValue) => {setValue(newValue);}} onChangeActive={(event, newHover) => {setHover(newHover);}} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} sx={{color: '#5743DB'}}/>
                            {labels[hover !== -1 ? hover : value]}
                        </Stack>
                        <Stack spacing={1} alignItems='left'>
                            <Typography>Provide feedback here:</Typography>  
                            <TextField label='Feedback' multiline rows = {8}  inputProps={{maxlength: CHARACTER_LIMIT}} valueChar={valuesChars.feedback} helperText={`${valuesChars.feedback.length}/${CHARACTER_LIMIT}`} onChange={handleChange("feedback")} variant='outlined' fullWidth required/>
                        </Stack>
                        <Stack spacing={1} alignItems='center'>   
                            <Button onClick={() => {feedbackEndpoint()}} text={"Submit"}></Button>
                        </Stack>
                    </Container> 
                </Card>
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

export default Feedback;