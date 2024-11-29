import React, { useState, useRef, useEffect } from 'react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const theme = createTheme({
  palette: {
    primary: {
      main: '#bbb',
    },
  },
});

interface CheckboxState {
  Undeployed: boolean;
  Deployed: boolean;
  Finished: boolean;
  Errored: boolean;
}

const CheckboxDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkboxes, setCheckboxes] = useState<CheckboxState>({
    Undeployed: true,
    Deployed: true,
    Finished: true,
    Errored: true,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxes({
      ...checkboxes,
      [event.target.name]: event.target.checked,
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getButtonText = () => {
    const selectedStates = Object.entries(checkboxes)
      .filter(([_, isChecked]) => isChecked)
      .map(([state, _]) => state);
    
    if (selectedStates.length === 0) return 'Select states';
    if (selectedStates.length === 1) return selectedStates[0];
    return `${selectedStates.length} states selected`;
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="relative inline-block text-left" ref={dropdownRef}
      style={{
        position: "relative",
        width: "200px",
        margin: "16px",
      }}>
        <Button
          variant="contained"
          onClick={handleToggle}
          endIcon={<ArrowDropDownIcon />}
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
            borderRadius: '4px',      
            zIndex: 1000,
          }}
        >
          {getButtonText()}
        </Button>

        {isOpen && (
          <div className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 1000,
            width: "100%",
            borderRadius: "8px",
            height: '26.5',
            marginTop: '4px',
          }}>
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {Object.entries(checkboxes).map(([state, isChecked], index) => (
                <FormControlLabel
                  key={state}
                  control={
                    <Checkbox
                      checked={isChecked}
                      onChange={handleCheckboxChange}
                      name={state}
                      sx={{
                        borderRadius: "4px",  
                        height: '16.5px',     
                        paddin: 0,
                      }}
                    />
                  }
                  label={state}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    height: '16.5px',
                    padding: '10px 15px',
                    margin: 0,
                    color: 'black',
                    backgroundColor: '#bbb',
                    '&:hover': {
                      backgroundColor: '#eee',
                    },
                    borderRadius: '4px',  
                    marginBottom: index < Object.entries(checkboxes).length - 1 ? '4px' : '0', 
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CheckboxDropdown;

