import React, { useState } from 'react';
import { ThemeProvider, withStyles } from "@mui/styles";
import { Chip } from '@mui/material';
import { Box } from '@mui/system';
import theme from '../Components/Theme';

const key = require('../api-key.json')

/*
  The colour of the tags is controlled in styleChip. The colour of the scroll bar is controlled in the index.css
*/

const StyleChip = withStyles({
    root: {
      backgroundColor:'#5743DB',
      color: 'white'
    }
  })(Chip);

export default function TagSelector(props) {
  const [tags, setTags] = useState(props.tags);

  return (
        <ThemeProvider theme={theme}>
            <Box sx={{overflowX: 'auto', width: '100%', display: 'flex', flexDirection: 'row', pb: '5px'}}>
                {tags.map((elem, index) => {
                  return <StyleChip key={index} label={elem.Name} sx={{mx: (index === 0 || index === tags.length - 1 ? '0px': '5px')}}></StyleChip>
                })}
            </Box>
        </ThemeProvider>
    )
}
    