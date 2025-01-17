import React from 'react';
import { Stack, Typography } from '@mui/material';
import Button from '../Components/Button';
import MenteeApprovalPage from '../Pages/MenteeApprovalPage';
import MentorSelectionPage from '../Pages/MentorSelectionPage';
import MeetingApprovalRequest from '../Pages/ApproveMeetingRequest';
import Feedback from '../Pages/Feedback';
import CreateWorkshop from '../Pages/CreateWorkshop';
import CreateMilestones from '../Pages/CreateMilestones';
import ApproveGroupSession from '../Pages/ApproveGroupSession';
import WatchlistApprovalPage from '../Pages/ApproveWatchlistRequest';

/*
    Alert Types
    ###Types 1-5: Mentoring Partnerships###
    -- Type 1: Accept/Reject Mentee. (Accept Reject screen)
    -- Type 2: Accept/Reject Mentor. (Accept Reject List View)
    -- Type 3: Meeting Schedule Request.
    -- Type 4: Meeting Scheduled Confirmation.
    -- Type 5: Mentoring Partnership has been ended.
    ###Types 6-8: Feedback###
    -- Type 6: Mentor Needs to give Feedback after session.
    -- Type 7: Both Mentor/Mentee need to give feedback after mentoring partnership was ended.
    -- Type 8: Attendees need to give feedback about workshop.
    ###Types 9-13: Workshops###
    -- Type 9: Workshop happening in watchlist
    -- Type 10: Demand for workshop in user's area of expertise.
    -- Type 11: User has been invited to co-host a workshop.
    -- Type 12: Workshop Cancelled
    -- Type 13: Workshop Edited(Updated)
    ###Type 14: Warnings###
    -- Type 14: Mentor has not listed the times they are free.
    ###Type 16: Group Sessions###
    -- Type 16: Accept/Reject Group Session.
*/


export default function AlertProcessor(props) {
    if (props.type === "minimised") {
        switch (props.getAlerts.type) {
            case 1:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>You have been selected as a suitable mentor for this/these mentee/s.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )
            case 2:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>A suitable mentor has offered to mentor you.</Typography><Button buttonClass="SidePageButton" buttonId="Mentor Selection Page" text={"Review"}/></Stack>
                )
            case 3:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>Your Mentee has requested a meeting with you.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )
            case 5: 
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>A mentoring partner has ended their mentoring partnership with you.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )   
            case 6: 
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>Please provide your mentee with milestones.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )   
            case 7:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>You need to provide feedback on your mentoring partner.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )
            case 8:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>You need to provide feedback on the workshop you recently attended.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )
            case 9:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>Based on your watchlist, we recommend this workshop to you.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )
            case 10:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>Recommended {props.getAlerts.details.tagName} Workshop to host.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                ) 
            case 15:
                return (
                    <Stack spacing={1} alignItems='center'><Typography align='center'>Group Session Invitation.</Typography><Button buttonClass="SidePageButton" buttonId="Alerts" text={"Review"}/></Stack>
                )        
            default:
                return (
                    <></>
                )
        }
        
    }
    else if (props.type === "full") {
        switch (props.getAlerts.type) {
            case 1:
                return (
                    <MenteeApprovalPage getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>
                )
            case 2:
                return (
                    <MentorSelectionPage getAlerts={props.getAlerts} deleteAlert={props.deleteAlert} pageBool={false}/>
                )
            case 3:
                return (
                    <MeetingApprovalRequest getAlerts={props.getAlerts} deleteAlert={props.deleteAlert} pageBool={false}/>
                )
            case 6:
                return (
                    <CreateMilestones getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>
                )
            case 7:
                return (
                    <Feedback getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>
                )
            case 8:
                return (
                    <Feedback getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>
                )
            case 9:
                return (
                    <WatchlistApprovalPage getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>
                )

            case 10:
                return (
                    <Stack spacing={1} alignItems='center'><Typography variant='h5'>We Recommend you host a {props.getAlerts.details.tagName} Workshop</Typography><CreateWorkshop getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/></Stack>
                    
                )
            case 16:
                return (
                    <Stack spacing={1} alignItems='center'><ApproveGroupSession getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/></Stack>
                    
                )
            default:
                return (
                    <></>
                )
        }
    }
}