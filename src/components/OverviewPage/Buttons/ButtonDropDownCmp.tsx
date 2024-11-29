import React, { useRef, useState, useEffect } from "react";
import ChartButton from "./ChartButton";
import DropDownCard from "./DropDownCard";


const chartTypes = ["Bar Chart", "Point Chart", "Pie Chart"];

const ButtonWithDropDownCmp: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const drop = useRef<HTMLDivElement | null>(null);

  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!drop.current?.contains(target) && open) {
      setOpen(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [open]);

  const handleSelectChart = (chartType: string) => {
    setSelectedChart(chartType);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div
        className="dropdown"
        ref={drop}
        style={{
          position: "relative",
          width: "200px",
          margin: "16px",
        }}
      >
        <ChartButton 
          onClick={() => setOpen((prev) => !prev)} 
          text={selectedChart || "Bar Chart"}
        />
        {open && (
          <DropDownCard
            data={chartTypes}
            setOpen={setOpen}
            onSelectChart={handleSelectChart}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              zIndex: 1000,
              width: "100%",
              borderRadius: "8px",
              height: 'auto',
              marginTop: '4px',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ButtonWithDropDownCmp;

