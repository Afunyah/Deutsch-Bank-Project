import { Typography } from '@mui/material';
import React from 'react';
import ScheduleMeeting from '../Pages/ScheduleMeeting.js';
import MentorSelectionPage from "../Pages/MentorSelectionPage";
import Milestones from "../Pages/Milestones";
import PastMeetings from "../Pages/PastMeetings";
import RequestMentor from '../Pages/RequestMentor.js';
import CreateWorkshop from '../Pages/CreateWorkshop.js';
import ContactUs from '../Pages/ContactUs.js';
import AlertsPage from '../Pages/AlertsPage';
import Feedback from '../Pages/Feedback';
import MyFeedback from '../Pages/MyFeedback';
import AccountSettings from '../Pages/AccountSettings';
import EndMentorship from '../Pages/EndMentorship';
import AdminPanel from '../Pages/AdminPanel.js';
import GroupSession from '../Pages/GroupSession';
import BookOrCancel from '../Pages/BookOrCancel';


export default function SidePageHandler(props) {

    if (props.sidePageTitle === 'Milestones') {
        return (
            <Milestones />
        )
    }
    else if (props.sidePageTitle === 'Alerts') {
        return (
            <AlertsPage getAlerts={props.getAlerts} deleteAlert={props.deleteAlert} />
        )
    }
    else if (props.sidePageTitle === 'Schedule Meeting') {
        return (
            <ScheduleMeeting />
        )
    }
    else if (props.sidePageTitle === 'Past Meetings') {
        return (
            <PastMeetings />
        )
    }
    else if (props.sidePageTitle === 'Request Mentor') {
        return (
            <RequestMentor />
        )
    }
    else if (props.sidePageTitle === 'Create Workshop') {
        return (
            <CreateWorkshop />
        )
    }
    else if (props.sidePageTitle === 'Contact Us') {
        return (
            <ContactUs />
        )
    }
    else if (props.sidePageTitle === 'Account Settings') {
        return (
            <AccountSettings />
        )
    }
    else if (props.sidePageTitle === 'System Settings') {
        return (
            <></>
        )
    }
    else if (props.sidePageTitle === "Mentor Selection Page") {
        return (
            <MentorSelectionPage getAlerts={props.getAlerts} deleteAlert={props.deleteAlert} pageBool={true} />
        )
    }
    else if (props.sidePageTitle === 'Milestone Feedback' || props.sidePageTitle === 'End of Mentor Mentee Pairing Feedback' || props.sidePageTitle === 'Workshop Feedback') {
        return (
            <Feedback id={props.sidePageTitle} />
        )
    }
    else if (props.sidePageTitle === 'My Feedback') {
        return (
            <MyFeedback />
        )
    }
    else if (props.sidePageTitle === 'End Mentorship') {
        return (
            <EndMentorship />
        )
    }
    else if (props.sidePageTitle === 'Admin Panel') {
        return (
            <AdminPanel/>
        )
    }
    else if (props.sidePageTitle === 'Group Session') {
        return (
            <GroupSession/>
        )
    }
    else if (props.sidePageTitle === 'Cancel Workshop Booking') {
        return (
            <BookOrCancel page="Cancel"/>
        )
    }
    else if (props.sidePageTitle === 'Book Workshop') {
        return (
            <BookOrCancel page="Book"/>
        )
    }
    else {
        return (
            null
        )
    }
}
