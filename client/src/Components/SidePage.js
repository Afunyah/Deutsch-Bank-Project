import React, {useState, useEffect} from 'react';
import Card from '@mui/material/Card';
import {Typography, Button} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';


/*
    Width and height are for responsively resizing the sidepage.
    The rest is standard react components.
*/

function SidePage(props) {
    const [width, setWidth] = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);

    const sizeChange = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
        

    useEffect(() => {
        window.addEventListener("resize", sizeChange);
    })

    if (width >= height && height >= 500) {
        return (
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {md: 24, lg: 34, xl: 34}}}>{props.title}</Typography>
            <Card sx={{width: '100%', height: '70vh', borderRadius: "20px", overflowY: 'auto'}}>
                <div className='SidePageButton' id='sidePageChevron'>
                <Button size="large">
                    <ChevronLeftIcon fontSize="large" sx={{color: '#000078'}}/>
                </Button>
                </div>
                {props.component}
            </Card>
            </>
        )
    }
    else if (width >= 500) {
        return (
            <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {xs: 24, sm: 34}}}>{props.title}</Typography>
            <Card sx={{width: '100%', height: '140vh', borderRadius: "20px", overflow: 'auto'}}>
                <div className='SidePageButton'>
                <Button size="large">
                    <ChevronLeftIcon fontSize="large" sx={{color: '#000078'}}/>
                </Button>
                </div>
                {props.component}
            </Card>
            </>
        )
    }
    else {
        return (
        <>
            <Typography sx={{mb: '2.5vh', color: '#000078', fontStyle:"300", fontSize: {xs: 24, sm: 34}}}>{props.title}</Typography>
            <Card sx={{width: '100%', height: '80vh', borderRadius: "20px", overflow: 'auto'}}>
                <div className='SidePageButton'>
                <Button size="large">
                    <ChevronLeftIcon fontSize="large" sx={{color: '#000078'}}/>
                </Button>
                </div>
                {props.component}
            </Card>
        </>
        )
    }

}
    


export default SidePage;