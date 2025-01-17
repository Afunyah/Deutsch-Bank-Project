import React from 'react';
import {  useState, useEffect } from 'react';
import '@fontsource/roboto/300.css';
import { Card, Container, Grid, Typography, Stack, TextField, IconButton} from '@mui/material';
import Tab from '../Components/Tab';
import MentorTab from './MentorTab';
import PersonalDetails from './PersonalDetails';


const key = require('../api-key.json')


function AccountSettings(){
    const [isMentor, setIsMentor] = useState(localStorage.getItem('isMentor') === 'true');
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    //const[current_name, ]=useState(localStorage.getItem('first_name'));
        

    useEffect(() => {
        setIsMentor(localStorage.getItem('isMentor') === 'true');
    })
    return (
        <Container alignItems='center' justifyContent='center' sx={{height: '85%', width: '100%'}}>
            <Tab 
                tabSubjects={["Personal details", "Mentors/Mentees"]} 
                tabObjects={[
                            <PersonalDetails
                                requestedMentor={true}
                                claraTest ={true}
                                current_name='Clara'
                                Email = 'Jane@gmail.com'
                                Password = 'p******'
                                AOE='[finance, marketing]'
                                BusinessArea = 'finance'
                                mentorName='Eve Evans'
                                meetingConfirmed={true}
                                date='12th January 2022'
                                startTime='10:00'
                                endTime='11:00'
                            />,
                            <MentorTab
                                isMentor={isMentor} 
                            />
                      
                            //mentees={JSON.parse('[{"menteeName": "Alice Atkinson", "requestAnswered": "false", "date": "12th January 2022", "tags": "French, Public Speaking", "startTime": "11:00", "endTime": "12:00"}]')}
        
                            ]}
            />
           
        </Container>
                    

      
        
    )    
}

export default AccountSettings;
