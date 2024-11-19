import * as React from 'react';
import html2canvas from 'html2canvas';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';  
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SourceIcon from '@mui/icons-material/Source';
import SaveIcon from '@mui/icons-material/Save';
import MinerIcon from '@mui/icons-material/Hardware';
import ConformanceIcon from '@mui/icons-material/Balance';
import CustomOperatorIcon from '@mui/icons-material/AutoFixHigh';
import BusinessIcon from '@mui/icons-material/Business';
import { useSelector } from 'react-redux';
import { getActiveFlowData } from '../../redux/selectors';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft() {
  const theme = useTheme();
  const flowData = useSelector(getActiveFlowData);
  const [open, setOpen] = React.useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);

  const onDragStart = (event: React.DragEvent, nodeType: string, data: string, algorithmType: string | undefined) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({type: nodeType, data: data, algorithmType: algorithmType}));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleExport = (format: string) => {
    if (!flowData) {
      alert('No pipeline data to export.');
      return;
    }
    switch (format) {
      case 'JSON':
        exportAsJSON();
        break;
      case 'CSV':
        exportAsCSV();
        break;
      case 'PNG':
        exportAsPNG();
        break;
      case 'PDF':
        exportAsPDF();
        break;
      default:
        console.error('Unsupported format:', format);
    }
    handleCloseMenu();
  };
    const exportAsJSON = () => {
      const serializedData = JSON.stringify(flowData, null, 2);
      const blob = new Blob([serializedData], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pipeline_export_${Date.now()}.json`;
      link.click();
    };
  
    const exportAsCSV = () => {
      if (flowData) {
        const nodesCSV = flowData.nodes
        .map((node: any) => `${node.id},${node.type},${JSON.stringify(node.data)}`)
        .join('\n');
      const edgesCSV = flowData.edges
        .map((edge: any) => `${edge.source},${edge.target},${edge.sourceHandle},${edge.targetHandle}`)
        .join('\n');
  
      const csvContent = `Nodes:\n${nodesCSV}\n\nEdges:\n${edgesCSV}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pipeline_export_${Date.now()}.csv`;
      link.click();
      }
    };
  
    const exportAsPNG = async () => {
      const flowContainer = document.querySelector('.react-flow'); // Replace with the correct React Flow container class
      if (!flowContainer) {
        alert('Canvas not found. Ensure the React Flow container is accessible.');
        return;
      }
  
      const canvas = await html2canvas(flowContainer as HTMLElement);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `pipeline_export_${Date.now()}.png`;
      link.click();
    };
  
    const exportAsPDF = async () => {
      const flowContainer = document.querySelector('.react-flow');
      if (!flowContainer) {
        alert('Canvas not found. Ensure the React Flow container is accessible.');
        return;
      }
  
      const canvas = await html2canvas(flowContainer as HTMLElement);
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
  
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`pipeline_export_${Date.now()}.pdf`);
    };


  return (
      <Drawer
        PaperProps={{
            sx: {
                backgroundColor: '#292929',
                position: 'fixed',
                top: '64px',
                zIndex: 800
            }
        }}
        sx={{
          width: drawerWidth,
          position: 'static',
          flexGrow: 1,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
        open={open}
      >
        <Divider />
        <DrawerHeader>
        <Typography sx={{width: '100%', textAlign: 'center'}} variant="h6" noWrap component="div">
            Nodes
          </Typography>
        </DrawerHeader>
        <List>
            {[
                {text: 'Event log', icon: <SourceIcon/>, nodeType: 'dataSource', label: "", instanceType: "dataSource"}, 
                {text: 'Petri net', icon: <SourceIcon/>, nodeType: 'dataSource', label: "", instanceType: "dataSource"}, 
                {text: 'BPMN', icon: <SourceIcon/>, nodeType: 'dataSource', label: "", instanceType: "dataSource"}, 
                {text: 'Data sink', icon: <SaveIcon/>, nodeType: 'dataSink', label: "", instanceType: "dataSink"},
                {text: 'Miner', icon: <MinerIcon/>, nodeType: 'operator', label: "Miner", instanceType: "miner"},
                {text: 'Conformance checking', icon: <ConformanceIcon/>, nodeType: 'operator', label: "Conformance checker", instanceType: "conformance"},
                {text: 'Custom operator', icon: <CustomOperatorIcon/>, nodeType: 'operator', label: "Custom operator", instanceType: "custom"},
                {text: 'Organization', icon: <BusinessIcon/>, nodeType: 'organization', label: "Organization", instanceType: "organization"},
            ].map(({text, icon, nodeType, label, instanceType}) => (
                <>
                <ListItem key={text} disablePadding onDragStart={(event) => onDragStart(event, nodeType, label, instanceType)} draggable>
                    <ListItemButton>
                        <ListItemIcon>
                            {icon}
                        </ListItemIcon>
                        <ListItemText primary={text} />
                    </ListItemButton>
                </ListItem>
                </>
            ))}
        </List>
        <Button
          sx={{ margin: 2, backgroundColor: '#fff', color: '#292929' }}
          onClick={handleExportClick}
          variant="contained"
        >
          Export Pipeline
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleExport('JSON')}>Export as JSON</MenuItem>
          <MenuItem onClick={() => handleExport('CSV')}>Export as CSV</MenuItem>
          <MenuItem onClick={() => handleExport('PNG')}>Export as PNG</MenuItem>
          <MenuItem onClick={() => handleExport('PDF')}>Export as PDF</MenuItem>
        </Menu>
      </Drawer>
  );
}
