import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import PipelineCard from './PipelineCard';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addNewPipeline, setImageData, removePipeline, reorderPipelines, addNewFolder, moveCardToFolder as moveCardToFolderAction } from '../../redux/slices/pipelineSlice';
import { getPipelines } from '../../redux/selectors';
import FlowDiagram from './ImageGeneration/FlowDiagram';
import ReactDOM from 'react-dom';
import { toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState, useCallback } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutButton from './Buttons/LogoutButton';
import ResourceUpload from './Parts/ResourceUpload';
import { Organization, Repository } from "../../redux/states/apiState";
import { useAppSelector } from "../../hooks";
import { getOrganizations, getRepositories } from "../../redux/selectors/apiSelector";

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

export default function AutoGrid() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pipelines = useSelector(getPipelines);
  const [resourceUploadOpen, setResourceUploadOpen] = useState(false);
  const organizations: Organization[] = useAppSelector(getOrganizations);
  const repositories: Repository[] = useAppSelector(getRepositories);
  const [currentFolderID, setCurrentFolderID] = useState('');

  const handleResourceUploadOpen = () => {
    setResourceUploadOpen(true);
  };

  const handleResourceUploadClose = () => {
    setResourceUploadOpen(false);
  };

  const createNewPipeline = () => {
    dispatch(addNewPipeline({ id: `pipeline-${uuidv4()}`, currentFolderID, name: "unnamed pipeline", flowData: { nodes: [], edges: [] } }));
    { navigate("/pipeline") }
  }
  const createNewFolder = () => {
    dispatch(addNewFolder({ id: `pipeline-${uuidv4()}`, currentFolderID, flowData: { nodes: [], edges: [] } }));
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

  pipelines.map(({ pipeline: flowData, id, folderID }) => {
    const nodes = flowData.nodes;
    const edges = flowData.edges;
    const pipelineId = id;
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-10000px';
    container.id = pipelineId;
    document.body.appendChild(container);

    ReactDOM.render(
      <FlowDiagram nodes={nodes} edges={edges} />,
      container,
      () => {
        const width = 800;
        const height = 600;
        const nodesBounds = getNodesBounds(nodes!);
        const { x, y, zoom } = getViewportForBounds(nodesBounds, width, height, 0.5, 2, 1);

        toPng(document.querySelector(`#${pipelineId} .react-flow__viewport`) as HTMLElement, {
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
      }
    );
  });

  return (
    <Box sx={{ flexGrow: 1, flexBasis: "100%" }}>
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
            sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" }, marginRight: '10px' }}>
            Create Pipeline
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={createNewFolder}
            sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" } }}>
            Create Folder
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleResourceUploadOpen}
            sx={{ backgroundColor: "#bbb", "&:hover": { backgroundColor: "#eee" }, marginLeft: '10px' }}>
            Upload Resource
          </Button>
        </Box>
        <LogoutButton />
      </Box>
      <DndProvider backend={HTML5Backend}>
        <Grid container spacing={{ xs: 1, md: 1 }} sx={{ padding: '10px' }}>
          {filteredPipelines.map(({ id, name, imgData, isFolder, folderID }, index) => (
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
    </Box>
  );
}