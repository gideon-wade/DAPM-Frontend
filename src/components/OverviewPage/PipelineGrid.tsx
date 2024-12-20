import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import PipelineCard from './PipelineCard';
import {Button} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {
  addNewFolder,
  addNewPipeline,
  moveCardToFolder as moveCardToFolderAction,
  removePipeline,
  reorderPipelines,
  setImageData
} from '../../redux/slices/pipelineSlice';
import {getPipelines} from '../../redux/selectors';
import FlowDiagram from './ImageGeneration/FlowDiagram';
import {toPng} from 'html-to-image';
import {getNodesBounds, getViewportForBounds} from 'reactflow';
import {v4 as uuidv4} from 'uuid';
import {DndProvider} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import React, {useCallback, useEffect, useState} from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StatisticsButton from './Buttons/StatisticsButton';
import {BarChart, LineChart, PieChart} from '@mui/x-charts';
import ButtonWithDropDown from "./Buttons/ButtonDropDownCmp";
import CheckboxDropdown, {CheckboxState} from "./Buttons/SelectFilterButton";
import ResourceUpload from './Parts/ResourceUpload';
import {Organization, Repository} from "../../redux/states/apiState";
import {useAppDispatch, useAppSelector} from "../../hooks";
import {getOrganizations, getRepositories} from "../../redux/selectors/apiSelector";
import {UploadFile} from "@mui/icons-material";
import {resourceThunk} from "../../redux/slices/apiSlice";
import {createRoot} from "react-dom/client";

/**
 * All new changes are made by:
 * @Author: s204152, s204197, s204178, s183812
 */


interface DraggableGridItemProps {
  id: string;
  name: string;
  imgData: string;
  index: number;
  isFolder: boolean;
  folderID: string;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  moveCardToFolder: (cardId: string, folderId: string) => void;
  goToFolder: (folderID: string) => void;
  onDelete: (id: string) => void;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const DraggableGridItem: React.FC<DraggableGridItemProps> = ({ id, name, imgData, index, isFolder, folderID, moveCard, moveCardToFolder, goToFolder, onDelete }) => {
  return (
      <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
        <PipelineCard id={id} name={name} imgData={imgData} index={index} isFolder={isFolder} folderID={folderID} moveCard={moveCard} moveCardToFolder={moveCardToFolder} goToFolder={goToFolder} onDelete={onDelete} />
      </Grid>
  );
};

export default function AutoGrid({currentFolderID, setCurrentFolderID}: {currentFolderID: string, setCurrentFolderID: Function}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pipelines = useSelector(getPipelines);
  const [resourceUploadOpen, setResourceUploadOpen] = useState(false);
  const organizations: Organization[] = useAppSelector(getOrganizations);
  const repositories: Repository[] = useAppSelector(getRepositories);

  const handleResourceUploadOpen = () => {
    setResourceUploadOpen(true);
  };

  const handleResourceUploadClose = () => {
    setResourceUploadOpen(false);
    updateOrganizationSideBar();
  };

  const updateOrganizationSideBar = () => {
    // We update the sidebar to show the uploaded resources
    dispatch(resourceThunk({ organizations, repositories }) as any);
  };

  const createNewPipeline = () => {
    dispatch(addNewPipeline({ id: `pipelineNew-${uuidv4()}`, currentFolderID, name: "unnamed pipeline", flowData: { nodes: [], edges: [], state: 0} }));
    { navigate("/pipeline") }
  }
  const createNewFolder = () => {
    dispatch(addNewFolder({ id: `pipeline-${uuidv4()}`, currentFolderID, flowData: { nodes: [], edges: [], state: 0} }));
  }

  const handleDeletePipeline = (id: string) => {
    dispatch(removePipeline({ id, currentFolderID }));
  }
  const moveCard = (dragIndex: number, hoverIndex: number): void => {
    const updatedPipelines = Array.from(pipelines);
    const [removed] = updatedPipelines.splice(dragIndex, 1);
    updatedPipelines.splice(hoverIndex, 0, removed);
    dispatch(reorderPipelines(updatedPipelines));
  };

  const moveCardToFolder = (cardId: string, folderId: string): void => {
    dispatch(moveCardToFolderAction({ cardId, folderId }));
  };

  const goToFolder = (folderID: string): void => {
    setCurrentFolderID(folderID);
  };

  const goToParentFolder = useCallback(() => {
    const currentFolder = pipelines.find(p => p.id === currentFolderID);
    if (currentFolder) {
      setCurrentFolderID(currentFolder.folderID || '');
    }
  }, [currentFolderID, pipelines]);

  const filteredPipelines = pipelines.filter(pipeline =>
      (pipeline.folderID === currentFolderID && !pipeline.isFolder) ||
      (pipeline.isFolder && pipeline.folderID === currentFolderID)
  );

  const [currentStatsView, setCurrentStatsView] = useState(false);

  const handleToggleStatView = (newStatsView: boolean) => {
    setCurrentStatsView(newStatsView);
  };

  const [checkboxes, setCheckboxes] = useState<CheckboxState>({
    Undeployed: true,
    Deployed: true,
    Finished: true,
    Errored: true,
  });
  
  const [selectedChart, setSelectedChart] = useState<string>("Bar Chart");

  const sortPipelinesByState = useCallback(() => {
    const stateCount: number[] = [];
    const labels: string[] = [];
    Object.entries(stateMapping).forEach(([stateNum, stateName]) => {
      if (checkboxes[stateName]) {
        let count = 0;
        pipelines.forEach(pipeline => {
          if (pipeline.pipeline && pipeline.pipeline.state !== undefined && !pipeline.isFolder) {
            const state = pipeline.pipeline.state;
            if (state === parseInt(stateNum)) {
              count++;
            }
          }
        });
        stateCount.push(count);
        labels.push(stateName);
      }
    });
    return { stateCount, labels };
  }, [pipelines, checkboxes]);

  const stateMapping: { [key: number]: keyof CheckboxState } = {
    0: "Undeployed",
    1: "Deployed",
    2: "Finished",
    3: "Errored",
  };

  const RenderPreviewImageCallback: React.FC<{ nodes: any, edges: any, pipelineId: string, container: HTMLElement }> = ({ nodes, edges, pipelineId, container }) => {
    useEffect(() => {
      const width = 800;
      const height = 600;
      const nodesBounds = getNodesBounds(nodes!);
      const { x, y, zoom } = getViewportForBounds(nodesBounds, width, height, 0.5, 2, 1);
      const pipeline = document.querySelector(`#${pipelineId} .react-flow__renderer`) as HTMLElement;
      if (!pipeline) {
        console.log(`#${pipelineId} .react-flow__renderer not found`);
        return;
      }
      toPng(pipeline, {
        backgroundColor: '#333',
        width: width,
        height: height,
        style: {
          width: `${width}`,
          height: `${height}`,
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        },
      }).then((dataUrl) => {
        dispatch(setImageData({ id: pipelineId, imgData: dataUrl }));
        document.body.removeChild(container);
      });
    }, [nodes, edges, pipelineId, container]);

    return <FlowDiagram nodes={nodes} edges={edges} />;
  };


  pipelines.map(({ pipeline: flowData, id, folderID }) => {
    const nodes = flowData.nodes;
    const edges = flowData.edges;
    const pipelineId = id;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-10000px';
    container.id = pipelineId;
    document.body.appendChild(container);
    const root = createRoot(container)
    root.render(<RenderPreviewImageCallback nodes={nodes} edges={edges} pipelineId={pipelineId} container={container} />);
  });

  const renderChart = (stateCount: number[], labels: string[]) => {
    const commonProps = {
      height: 290,
      margin: { top: 10, bottom: 30, left: 40, right: 10 },
    };

    switch (selectedChart) {
      case "Bar Chart":
        return (
          <BarChart
            series={[{ data: stateCount }]}
            xAxis={[{ data: labels, scaleType: 'band' }]}
            yAxis={[{
              min: 0,
              max: Math.ceil(Math.max(...stateCount, 1)),
              tickNumber: Math.ceil(Math.max(...stateCount, 1)) + 1,
              tickMinStep: 1
            }]}
            {...commonProps}
          />
        );
      case "Point Chart":
        return (
          <LineChart
            series={[{ data: stateCount}]}
            xAxis={[{ data: labels, scaleType: 'point' }]}
            yAxis={[{
              min: 0,
              max: Math.ceil(Math.max(...stateCount, 1)),
              tickNumber: Math.ceil(Math.max(...stateCount, 1)) + 1,
              tickMinStep: 1
            }]}
            {...commonProps}
          />
        );
      case "Pie Chart":
        return (
          <PieChart
            series={[{ data: stateCount.map((value, index) => ({ value, label: labels[index] })) }]}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };
  

  const renderContent = () => {
    {/* TODO: Statistics View  - This should be seperate cards and dropdown menu for filters and charts*/}
    if (currentStatsView) {
      const { stateCount, labels } = sortPipelinesByState();
      return (
        <>
          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <ButtonWithDropDown selectedChart={selectedChart} onSelectChart={setSelectedChart} />
            <CheckboxDropdown checkboxes={checkboxes} setCheckboxes={setCheckboxes} />
          </Box>
          <Box sx={{ height: 400, width: '100%' }}>
            {renderChart(stateCount, labels)}
          </Box>
        </>
      );
    }

    {/* Pipeline Grid View */}
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={goToParentFolder}
            disabled={currentFolderID === ''}
            sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" } }}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createNewPipeline}
              sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" }, marginRight: '10px' }}
            >
              Create Pipeline
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={createNewFolder}
              sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" } }}
            >
              Create Folder
            </Button>
            <Button
                variant="contained"
                startIcon={<UploadFile />}
                onClick={handleResourceUploadOpen}
                sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" }, marginLeft: '10px' }}>
              Upload Resource
            </Button>
          </Box>
          <Box></Box>
        </Box>
        <DndProvider backend={HTML5Backend}>
          <Grid container spacing={{ xs: 1, md: 1 }} sx={{ padding: '10px' }}>
            {filteredPipelines.map(({ id, name, imgData, isFolder, folderID}, index) => (
              <DraggableGridItem
                key={id}
                id={id}
                name={name}
                imgData={imgData}
                index={index}
                isFolder={isFolder}
                folderID={folderID}
                moveCard={moveCard}
                moveCardToFolder={moveCardToFolder}
                goToFolder={goToFolder}
                onDelete={handleDeletePipeline}
              />
            ))}
          </Grid>
        </DndProvider>
        <ResourceUpload
            orgs={organizations}
            reps={repositories}
            open={resourceUploadOpen}
            onClose={handleResourceUploadClose}
        />
      </>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, flexBasis: "100%" }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px' }}>
        <Box sx={{ display: 'flex', gap: '10px' }}>
          <StatisticsButton onToggle={handleToggleStatView} />
          {/*<LogoutButton />*/}
        </Box>
      </Box>
      {renderContent()}
    </Box>
  );
}