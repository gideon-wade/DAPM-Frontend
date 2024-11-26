import React, { useState } from 'react';
import { Button } from '@mui/material';

interface StatisticsButtonProps {
  onToggle?: (newStatsView: boolean) => void; 
}

const StatisticsButton: React.FC<StatisticsButtonProps> = ({ onToggle }) => {
  const [statsView, setStatsView] = useState(false);

  const handleClick = () => {
    const newStatsView = !statsView;
    setStatsView(newStatsView);
    if (onToggle) onToggle(newStatsView); 
  };

  return (
    <Button
      variant="contained"
      style={{ float: 'right' }}
      className="float-right"
      onClick={handleClick}
    >
      {statsView ? "Pipelines" : "Statistics"}
    </Button>
  );
};

export default StatisticsButton;
