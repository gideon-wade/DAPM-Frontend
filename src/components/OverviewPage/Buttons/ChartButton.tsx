import React from "react";
import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const theme = createTheme({
  palette: {
    primary: {
      main: "#bbb",
    },
  },
});

interface ButtonProps {
  onClick: () => void;
  text: string;
}

const ChartButton: React.FC<ButtonProps> = ({ onClick, text }) => (
  <ThemeProvider theme={theme}>
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      endIcon={<ArrowDropDownIcon />}
      fullWidth
      sx={{
        backgroundColor: '#bbb',
        color: 'black',
        '&:hover': {
          backgroundColor: '#eee',
        },
        textTransform: 'none',
        minWidth: '200px',        
        height: '36.5px',         
        padding: '10px 15px',     
        justifyContent: 'space-between',
        zIndex: 1000,
      }}
    >
      {text}
    </Button>
  </ThemeProvider>
);

export default ChartButton;

