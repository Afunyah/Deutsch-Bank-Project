import React, { useState, useEffect} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { withStyles } from "@mui/styles";
import theme from '../Components/Theme';
import { ThemeProvider } from '@mui/material/styles';

const key = require('../api-key.json')

/*
  The colour of the tags is controlled in the customAutocomplete. The text colour is .MuiChip-label.
*/

const CustomAutocomplete = withStyles({
    root: { 
    }, 
    tag: { 
     backgroundColor: '#5743DB' 
    }, 
    '& + .MuiChip-label': {  
      "& span": { 
        color: 'white' 
      } 
    } 
  })(Autocomplete);


export default function TagSelector(props) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(props.startingTags);
  const defaultValues = props.startingTags;

  function loadTags() {
    (async () => {
      var branchName = localStorage.getItem('branch');
      const response = await fetch ('http://localhost:3001/api/tags', {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              "api-key": key['key']
          },
      })
      const tags = await response.json();
      setOptions(tags);
      setLoading(false);
    })();
  }

  useEffect(() => {
    if (loading === true) {
      loadTags();
    }
  }, [open]);

  return (
    <ThemeProvider theme={theme}>
      <CustomAutocomplete
          multiple
          id="tags-standard"
          size="small"
          options={options}
          inputValue={selected.Name}
          defaultValue={defaultValues}
          disableCloseOnSelect
          loading={loading}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
            props.stateFunction(selected);
          }}
          filterSelectedOptions
          ChipProps={{
            color: 'secondary'
          }}
          onChange={(e, option) => {
            if (!open) {
              props.stateFunction(option);
            }
            setSelected(option);
          }}
          isOptionEqualToValue={(option, value) => option.Name === value.Name}
          getOptionLabel={(option) => option.Name}
          renderInput={ params => {
            const { InputProps, ...restParams } = params;
            const { startAdornment, ...restInputProps } = InputProps;
            return (
              <TextField
                { ...restParams }
                InputProps={ {
                  ...restInputProps,
                  startAdornment: (
                    <div style={ {
                      padding: '10px',
                      maxHeight: '20vh',
                      overflowY: 'auto',
                    } }
                    >
                      {startAdornment}
                    </div>
                  ),
                } }
                variant="outlined"
                label="Tags"
                placeholder='Add Developmental Interests'
              />
            );
          } }
      />
      </ThemeProvider>
    )
}
    