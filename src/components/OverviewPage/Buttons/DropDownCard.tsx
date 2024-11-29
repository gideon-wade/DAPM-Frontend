import React from "react";
import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#bbb",
    },
  },
});

interface DropDownCardProps {
  data: string[];
  setOpen: (value: boolean) => void;
  onSelectChart: (chartType: string) => void;
  style?: React.CSSProperties;
}

const DropDownCard: React.FC<DropDownCardProps> = ({ data, setOpen, onSelectChart, style }) => (
  <ThemeProvider theme={theme}>
    <div className="shadow bg-white rounded-lg border border-gray-300" style={style}>
      {data.map((item, i) => (
        <Button
          key={i}
          fullWidth
          onClick={() => {
            onSelectChart(item);
            setOpen(false);
          }}
          sx={{
            justifyContent: "flex-start",
            backgroundColor: "#bbb",
            color: "black",
            "&:hover": {
              backgroundColor: "#eee",
            },
            padding: "10px 15px",
            borderRadius: '4px',
            height: '36.5px', 
            textTransform: "none",
            borderBottom: i < data.length - 1 ? "4px" : "0",
            marginBottom: '4px',
          }}
        >
          {item}
        </Button>
      ))}
    </div>
  </ThemeProvider>
);

export default DropDownCard;

