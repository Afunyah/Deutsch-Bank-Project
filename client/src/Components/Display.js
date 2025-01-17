import React, {  useState, useEffect } from 'react';
import { Container } from '@mui/material';
import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Sidebar from "./Sidebar";
import Dashboard from '../Pages/Dashboard';
import Profile from '../Pages/Profile';
import Workshops from '../Pages/Workshops';
import SidePage from './SidePage';
import SidePageHandler from '../Utility/SidePageHandler';

/*
    page is a state that holds which page the user is on or needs to go to.
    enter_ is a state that makes the slide transition of that page occur.
    lastPage is a state that holds the last page the user was on for certain transitions that need this information to determine which direction the transition occurs.
    boxRef is for the slide transitions and stops the annoying scrollbar popping up issue.
    The stateRefs are there so that components in other functional components can access the page and last page states. This is how sidepagebuttons work.
*/




export default function Display(props) {
    const [page, _setPage] = useState(0);
    const [enterDash, setEnterDash] = useState(true);
    const [enterProfile, setEnterProfile] = useState(false);
    const [enterWorkshops, setEnterWorkshops] = useState(false);
    const [enterSidePage, setEnterSidePage] = useState(false);
    const [enterMainPage, setEnterMainPage] = useState(true);
    const [sidePageContent, setSidePageContent] = useState("empty");
    const [lastPage, _setLastPage] = useState(0);
    const boxRef = React.useRef(null);

    const pageStateRef = React.useRef(page);
    const setPageState = data => {
        pageStateRef.current = data;
        _setPage(data);
    };

    const lastPageStateRef = React.useRef(lastPage);
    const setLastPageState = data => {
        lastPageStateRef.current = data;
        _setLastPage(data);
    };
    
    function changeSidePage() {
        if (pageStateRef.current !== 3) {
            setLastPageState(pageStateRef.current);
            setPageState(3);
            setEnterMainPage(false);
            setSidePageContent(this.id);
        }
        else {
            setPageState(lastPageStateRef.current);
            setLastPageState(pageStateRef.current);
            setEnterSidePage(false);
        }
    }    

    /*
        This useffect is for transitions. It sets listeners on the sidebar buttons and the sidepageButtons. It adds an attribute which prevents multiple listeners being
        added to the same component.
    */

    useEffect(() => {
        const dash = document.getElementById("Dashboard");
        const prof = document.getElementById("Profile");
        const work = document.getElementById("Workshops");


        if (dash.getAttribute('listener') !== 'true') {
            dash.addEventListener("click", function() {
                if (pageStateRef.current !== 0) {
                    setLastPageState(pageStateRef.current);
                    setPageState(0);
                    setEnterProfile(false);
                    setEnterWorkshops(false);
                    setEnterSidePage(false);
                }
            });
            dash.setAttribute('listener', 'true');
        }
        
        if (prof.getAttribute('listener') !== 'true') {
            prof.addEventListener("click", function() {
                if (pageStateRef.current !== 1) {
                    setLastPageState(pageStateRef.current);
                    setPageState(1);
                    setEnterDash(false);
                    setEnterWorkshops(false);
                    setEnterSidePage(false);
                }
            });
            prof.setAttribute('listener', 'true');
        }   

        if (work.getAttribute('listener') !== 'true') {
            work.addEventListener("click", function() {
                if (pageStateRef.current !== 2) {
                    setLastPageState(pageStateRef.current);
                    setPageState(2);
                    setEnterDash(false);
                    setEnterProfile(false);
                    setEnterSidePage(false);
                }
            });
            work.setAttribute('listener', 'true');
        }
            
        const targetNode = document.getElementById('PageContainer');
        const config = {attributes: true, childList: true, subtree: true };

        const callback = () => {
            var sidePageButtons = document.getElementsByClassName("SidePageButton");
            for (var i = 0; i < sidePageButtons.length; i++) {
                if (sidePageButtons[i].getAttribute('listener') !== 'true') {
                    sidePageButtons[i].addEventListener('click', changeSidePage);
                    sidePageButtons[i].setAttribute('listener', 'true');
                }
            }
        };
    
    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    })



    function changePage() {
        if (page === 0) {
            setEnterDash(true);
            setEnterMainPage(true);
        } 
        else if (page === 1) {
            setEnterProfile(true);
            setEnterMainPage(true);
        }
        else if (page === 2) {
            setEnterWorkshops(true);
            setEnterMainPage(true);
        }
        else if (page === 3) {
            setEnterSidePage(true);
        }
    }

    /*
        This holds all the main pages. With slide transitions.
    */

    return (
        <Container id="PageContainer" maxWidth='100vw' sx={{pl: {xs: '5%', sm: 'calc(10% + 73px)', md: 'calc(10% + 73px)', lg: 'calc(10% + 73px)', xl: 'calc(10% + 73px)'}, pr: {xs: '5%', sm: 'calc(10%)', md: 'calc(10%)', lg: 'calc(10%)', xl: 'calc(10%)'}, overflow: 'hidden'}}>
            <Sidebar name="Alice" setToken={(newValue) => {props.setToken(newValue)}} getAlerts={props.getAlerts}/>
            <Box sx={{ height: 'auto', pt: {xs: 'calc(2.5% + 56px)', sm: 'calc(2.5% + 64px)', md: 'calc(2.5% + 64px)', lg: 'calc(2.5% + 64px)', xl: 'calc(2.5% + 64px)'}, pb: '5px'}}>
            <Slide direction="right" appear={false} in={enterMainPage} mountOnEnter unmountOnExit onExited={changePage} container={boxRef.current}>
                <div>
                    <Slide direction="down" appear={false} in={enterDash} mountOnEnter unmountOnExit onExited={changePage} container={boxRef.current}>
                        <div>
                            <Dashboard getAlerts={props.getAlerts} setToken={props.setToken}/>
                        </div>
                    </Slide>
                    <Slide appear={false} direction={ page === 1 ? (lastPage === 0 ? "up" : "down") : (page === 0 ? "up" : "down")} in={enterProfile} mountOnEnter unmountOnExit onExited={changePage} container={boxRef.current}>
                        <div>
                            <Profile getAlerts={props.getAlerts}/>
                        </div>
                    </Slide>
                    <Slide appear={false} direction="up" in={enterWorkshops} mountOnEnter unmountOnExit onExited={changePage} container={boxRef.current}>
                        <div>
                            <Workshops getAlerts={props.getAlerts}/>
                        </div>
                    </Slide>
                </div>
            </Slide>
            <Slide direction="left" in={enterSidePage} mountOnEnter unmountOnExit onExited={changePage} container={boxRef.current}>
                <div>
                    <SidePage title={sidePageContent} component={<SidePageHandler sidePageTitle={sidePageContent} getAlerts={props.getAlerts} deleteAlert={props.deleteAlert}/>}/>
                </div>
            </Slide>
            </Box>
        </Container>
    )
}
