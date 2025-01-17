import React, {  useState, useEffect } from 'react';
import { Typography, Grid, Card, Container, Stack, Chip, CircularProgress, Box } from '@mui/material';
import { withStyles } from '@mui/styles';
import Tab from '../Components/Tab';
import TagSelector from '../Components/TagSelector';
import VerticalFourBox from "../Components/VerticalFourBox";
import Button from '../Components/Button';
import TagDisplay from '../Components/TagDisplay'

const key = require('../api-key.json')

const StyleChip = withStyles({
    root: {
      backgroundColor:'#5743DB',
      color: 'white'
    }
  })(Chip);

  const StyleCircularProgress = withStyles({
    root: {
        color:'#5743DB',
    }
})(CircularProgress);

function watchlistToDB(tagArray) {
    var userID = localStorage.getItem('user_id');
    var branch = localStorage.getItem('branch');
    localStorage.setItem('watchlist', JSON.stringify(tagArray))
    
    fetch ('http://localhost:3001/api/workshops/updateWatchlist', {
        method: 'POST',
        credentials : 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menteeID: userID, branchName: branch, watchlist: tagArray })
    })
        .then(data => data.json())
}



function Workshops(){
    const workshopInitial = [
        {
          workshopID : "",
          Name: "",
          expertdetails: [
            {email: "",
            first_name: "",
            last_name: ""} 
        ],
          location: "",
          isOnline: "",
          date: "",
          capacity: 0,
          nBooked: 0,
        }]
    const [workshopStatus, setWorkshopStatus] = useState(workshopInitial);
    const [bookedWorkshops, setBookedWorkshops] = useState(workshopInitial);
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const [isMentor, setIsMentor] = useState(false);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [loadingBooked, setLoadingBooked] = useState(true);

    function workshopsel() {
        (async () => {
            var branch = localStorage.getItem('branch');
            var userID = localStorage.getItem('user_id');
            const response = await fetch ('http://localhost:3001/api/workshops/workshopSel', {
              method: 'POST',
              credentials : 'include',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userBranch: branch, userID: userID})
          })
          const workshopsAvailable = await response.json();
          setWorkshopStatus(workshopsAvailable);
          setLoadingUpcoming(false);
        })();
      }

    function workshopsBooked() {
        (async () => {
            var userID = localStorage.getItem('user_id');
            const response = await fetch ('http://localhost:3001/api/workshops/bookedWorkshops', {
                method: 'POST',
                credentials : 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menteeID: userID})
            })
            const workshopsBooked = await response.json();
            setBookedWorkshops(workshopsBooked);
            setLoadingBooked(false);
        })();
    }

    function bookAWorkshop(workshopID) {
        var userID = localStorage.getItem('user_id');
        fetch ('http://localhost:3001/api/workshops/bookAWorkshop', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menteeID: userID, workshopID : workshopID})
        })
    }

    function unBookAWorkshop(workshopID) {
        var userID = localStorage.getItem('user_id');
        fetch ('http://localhost:3001/api/workshops/unbookAWorkshop', {
            method: 'POST',
            credentials : 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menteeID: userID, workshopID : workshopID})
        })
    }

    useEffect(() => {
        if (loadingUpcoming) {
            workshopsel();
        }
        if (loadingBooked) {
            workshopsBooked();
        }
    });


    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }

    
        
    useEffect(() => {
        window.addEventListener("resize", sizeChange);
        setIsMentor(localStorage.getItem('isMentor') === 'true')
    }, [isMentor])

    if (width >= height && height >= 500 && width >= 800) {
        return (
            <>
            <Typography sx={{mb: '5vh', color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>Workshops</Typography>
            <Grid container spacing={{xs: 2, sm: 4, md: 6, lg: 8, xl: 12}} sx={{height: '100%', justifyContent: 'center'}}>
                <Grid item xs={8}>
                    <Card elevation={3} sx={{width: '100%', height: '70vh', borderRadius: "20px"}}>
                        <Container sx={{height: 'auto'}}>
                            <Tab tabSubjects={["Upcoming", "Booked"]} tabObjects={[
                                <>
                                {!loadingUpcoming && 
                                    <VerticalFourBox title='Upcoming' components={
                                        workshopStatus.map((elem, index) => {
                                            var exp = (elem.expertdetails)[0];
                                            if (exp !== undefined) {
                                                var fullName = exp.first_name.concat(" ", exp.last_name);
                                            }
                                            var space = elem.capacity - elem.nBooked;
                                            var hostType = elem.isOnline ? "Online" : "In-Person";
                                            var dateTime = (elem.date === null ? undefined : new Date(elem.date))
                                            return (
                                                <Grid container spacing={3}>
                                                    <Grid item xs={9}>
                                                        <Stack spacing={1}>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Name: </Typography>
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[{"Name" : elem.Name}]}/>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Hosts: </Typography> 
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[{"Name" : fullName}]}/>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Details:</Typography>
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[
                                                                        {"Name" : "Topic: " + elem.Tag},
                                                                        {"Name" : "Time: " + (dateTime ? dateTime.toLocaleTimeString() : undefined)},
                                                                        {"Name" : "Date: " + (dateTime ? dateTime.toLocaleDateString() : undefined)},
                                                                        {"Name" : "Type: " + hostType},
                                                                        {"Name" : "Location: " + elem.location},
                                                                        {"Name" : "Spots Avaiable : " + space}
                                                                    ]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <Box sx={{height: '100%', display: 'flex', alignItems: 'center'}}>
                                                            {exp._id !== localStorage.getItem('user_id') &&
                                                                <Button 
                                                                    onClick= {()=>{localStorage.setItem('selectedWorkshop', elem._id)} }
                                                                    text='Book Workshop'
                                                                    buttonClass="SidePageButton"
                                                                    buttonId="Book Workshop"
                                                                />
                                                            }
                                                            {exp._id === localStorage.getItem('user_id') &&
                                                                 <Button text="Cancel Workshop" color={1}/>
                                                            }
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )
                                        })
                                    }/> 
                                }
                                {loadingUpcoming &&
                                    <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <StyleCircularProgress/>
                                    </Box>
                                }
                                </>,
                                <>
                                {!loadingBooked && 
                                    <VerticalFourBox title='Booked' components={
                                        bookedWorkshops.map((elem, index) => {
                                            var exp = (elem.expertdetails)[0];
                                            if (exp !== undefined) {
                                                var fullName = exp.first_name.concat(" ", exp.last_name);
                                            }
                                            var fullName = exp.first_name.concat(" ", exp.last_name);
                                            var space = elem.capacity - elem.nBooked;
                                            var hostType = elem.isOnline? "Online" : "In-Person";
                                            var dateTime = (elem.date === null ? undefined : new Date(elem.date))
                                            return (
                                                <Grid container spacing={0}>
                                                    <Grid item xs={9}>
                                                        <Stack spacing={1}>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Name: </Typography>
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[{"Name" : elem.Name}]}/>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Hosts: </Typography> 
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[{"Name" : fullName}]}/>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container spacing={0}>
                                                                <Grid item xs={3}>
                                                                    <Typography variant="h6">Details: </Typography>
                                                                </Grid>
                                                                <Grid item xs={9}>
                                                                    <TagDisplay tags={[
                                                                        {"Name" : "Time: " + (dateTime ? dateTime.toLocaleTimeString() : undefined)},
                                                                        {"Name" : "Date: " + (dateTime ? dateTime.toLocaleDateString() : undefined)},
                                                                        {"Name" : "Type: " + hostType},
                                                                        {"Name" : "Location: " + elem.location},
                                                                        {"Name" : "Spots Avaiable : " + space}
                                                                    ]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Stack>
                                                    </Grid>
                                                    <Grid item xs={3}>
                                                        <Box sx={{height: '100%', display: 'flex',  justifyContent: 'flex-end', alignItems: 'center'}}>
                                                            <Button 
                                                                onClick= {()=>{localStorage.setItem('selectedWorkshop', elem._id)}}
                                                                text='Cancel'
                                                                buttonClass="SidePageButton"
                                                                buttonId="Cancel Workshop Booking"
                                                                color={1}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            )
                                        })
                                    }/>
                                }
                                {

                                }
                                </>
                            ]}/>
                        </Container>
                        <Container sx={{width: '100%', display: 'flex', justifyContent: "center"}}>
                            {isMentor && !loadingUpcoming && !loadingBooked && <Button buttonClass={"SidePageButton"} buttonId={"Create Workshop"} text={"Host your own Event"}></Button>}
                        </Container>
                    </Card>
                </Grid>
                <Grid item xs={4}>
                    <Card elevation={3} sx={{width: '100%', height: '70vh', borderRadius: "20px"}}>
                        <Typography variant="h4" sx={{ p: '2.5vh', color:'#000078'}}>Watchlist</Typography>
                        <Container sx={{p: '2.5vh', overflowY: 'auto', height: '60%', width: '100%'}}>
                            <TagSelector stateFunction={(tagArray) => {watchlistToDB(tagArray)}} startingTags={JSON.parse(localStorage.getItem('watchlist'))}/>
                        </Container>
                    </Card>
                </Grid>
            </Grid>
            </>
        )
    }
    else {
        return(
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: '6.5vh'}}>Workshops</Typography>
            <Grid container spacing={{xs: 2, sm: 4, md: 8, lg: 12, xl: 24}} sx={{height: '100%', justifyContent: 'center', pb: '5%'}}>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '65vh', borderRadius: "20px"}}>
                        <Tab tabSubjects={["Upcoming", "Booked"]} tabObjects={[
                            <>
                            {!loadingUpcoming && 
                                <VerticalFourBox title='Upcoming' components={
                                    workshopStatus.map((elem, index) => {
                                        var exp = (elem.expertdetails)[0];
                                        var fullName = exp.first_name.concat(" ", exp.last_name);
                                        var space = (elem.nBooked).toString().concat("/",elem.capacity.toString());
                                        var hostType = elem.isOnline ? "Online" : "In-Person";
                                        var dateTime = (elem.date === null ? undefined : new Date(elem.date))
                                        return (
                                            <Grid container spacing={0}>
                                                <Grid item xs={8}>
                                                    <Stack spacing={0.5}>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Name: </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <TagDisplay tags={[{"Name" : elem.Name}]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Hosts: </Typography> 
                                                                </Grid>
                                                                <Grid item>
                                                                    <TagDisplay tags={[{"Name" : fullName}]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Details: </Typography>
                                                                </Grid>
                                                                <Grid item>  
                                                                    <TagDisplay tags={[
                                                                        {"Name" : "Time: " + (dateTime ? dateTime.toLocaleTimeString() : undefined)},
                                                                        {"Name" : "Date: " + (dateTime ? dateTime.toLocaleDateString() : undefined)},
                                                                        {"Name" : "Type: " + hostType},
                                                                        {"Name" : "Location: " + elem.location},
                                                                        {"Name" : "Spots Avaiable : " + space}
                                                                    ]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                                                        <Button 
                                                            onClick= {()=>{localStorage.setItem('selectedWorkshop', elem._id)} }
                                                            text='Book'
                                                            buttonClass="SidePageButton"
                                                            buttonId="Book Workshop"
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        )
                                    })
                                }/> 
                            }
                            {loadingUpcoming &&
                                <Box sx={{height: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <StyleCircularProgress/>
                                </Box>
                            }
                            </>,
                            <>
                            {!loadingBooked && 
                                <VerticalFourBox title='Booked' components={
                                    bookedWorkshops.map((elem, index) => {
                                        console.log(elem)
                                        var exp = (elem.expertdetails)[0];
                                        var fullName = exp.first_name.concat(" ", exp.last_name);
                                        var space = (elem.nBooked).toString().concat("/",elem.capacity.toString());
                                        var hostType = elem.isOnline? "Online" : "In-Person";
                                        var dateTime = (elem.date === null ? undefined : new Date(elem.date))
                                        return (
                                            <Grid container spacing={0}>
                                                <Grid item xs={8}>
                                                     <Stack spacing={0.5}>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Name: </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <TagDisplay tags={[{"Name" : elem.Name}]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Hosts: </Typography> 
                                                                </Grid>
                                                                <Grid item>
                                                                    <TagDisplay tags={[{"Name" : fullName}]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container spacing={0}>
                                                            <Grid item xs={12}>
                                                                <Grid item>
                                                                    <Typography variant="h6">Details: </Typography>
                                                                </Grid>
                                                                <Grid item>  
                                                                    <TagDisplay tags={[
                                                                        {"Name" : "Time: " + (dateTime ? dateTime.toLocaleTimeString() : undefined)},
                                                                        {"Name" : "Date: " + (dateTime ? dateTime.toLocaleDateString() : undefined)},
                                                                        {"Name" : "Type: " + hostType},
                                                                        {"Name" : "Location: " + elem.location},
                                                                        {"Name" : "Spots Avaiable : " + space}
                                                                    ]}/>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Box sx={{height: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                                                        <Button 
                                                            onClick= {()=>{localStorage.setItem('selectedWorkshop', elem._id)}}
                                                            text='Cancel'
                                                            buttonClass="SidePageButton"
                                                            buttonId="Cancel Workshop Booking"
                                                            color={1}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        )
                                    })
                                }/>
                            }
                            {

                            }
                            </>
                        ]}/>
                    </Card>
                    {isMentor && !loadingUpcoming && !loadingBooked && <Grid sx={{width: '100%', display: 'flex', justifyContent: "center", pt: '2%'}}>
                        <Button buttonClass={"SidePageButton"} buttonId={"Create Workshop"} text={"Host your own Event"}/>
                    </Grid>}
                </Grid>
                <Grid item xs={12}>
                    <Card elevation={3} sx={{width: '100%', height: '60vh', borderRadius: "20px"}}>
                        <Typography variant="h5" sx={{p: '2vh', color:'#000078'}}>Watchlist</Typography>

                        <Container sx={{p: '2.5vh', overflowY: 'auto', height: '60%', width: '100%'}}>
                            <TagSelector stateFunction={(tagArray) => {watchlistToDB(tagArray)}} startingTags={JSON.parse(localStorage.getItem('watchlist'))}/>
                        </Container>
                    </Card>
                </Grid>
            </Grid>
            </>
        )
    }
}

export default Workshops;