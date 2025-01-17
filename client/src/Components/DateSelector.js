import * as React from 'react';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import isWeekend from 'date-fns/isWeekend';
import { TextField } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './Theme';


/*
    handleChange a function that changes the state in the parent functional component. It also formats the dates for how the backend needs them.
*/


function DateSelector(props) {
    const [value, setValue] = React.useState(null);

    function handleChange(newValue) {
        var dateString = newValue.toLocaleDateString('en-ZA');
        dateString = dateString.replaceAll('/', '-')
        props.changeFunction(dateString);
        setValue(newValue);
    }

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Date"
                    value={value}
                    onChange={(newValue) => {handleChange(newValue)}}
                    inputFormat="dd/MM/yyyy"
                    mask=""
                    disablePast
                    shouldDisableDate={isWeekend}
                    renderInput={(input) => <TextField {...input}/>}
                    />
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default DateSelector;