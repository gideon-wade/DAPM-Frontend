import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActivePipeline } from '../../redux/slices/pipelineSlice';
import { useDrag, useDrop } from 'react-dnd';
import SourceIcon from '@mui/icons-material/Source';

const ItemType = 'CARD';

export interface PipelineCardProps {
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

export default function PipelineCard({ id, name, imgData, index, isFolder, folderID, moveCard, moveCardToFolder, goToFolder, onDelete }: PipelineCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToPipeline = () => {
    if(!isFolder) {
      dispatch(setActivePipeline(id));
      navigate('/pipeline');
    }
    else {
      goToFolder(id)
    }
  };
  const handleDelete = () => {
    onDelete(id); 
  };
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id, index, isFolder, folderID },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { id: string, index: number, isFolder: boolean, folderID: string }) {
      if (item.id !== id) {
        if (!isFolder) {
          moveCard(item.index, index);
          item.index = index;
        }
      }
    },
    drop(item: { id: string, index: number, isFolder: boolean, folderID: string }) {
      if (item.id !== id) {
        if (isFolder) {
          moveCardToFolder(item.id, id);
        } else {
          moveCard(item.index, index);
          item.index = index;
        }
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card sx={{ maxWidth: 345 }}>
        <CardActionArea>
          <CardMedia
            sx={{ 
              height: 140, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: isFolder ? 'rgba(0, 0, 0, 0.08)' : 'inherit'
            }}
            title={name}
            onClick={navigateToPipeline}
          >
            {isFolder ? (
              <SourceIcon sx={{ fontSize: 64, color: '#1976d2' }} />
            ) : (
              <img src={imgData} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </CardMedia>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div" onClick={navigateToPipeline}>
              {name}
            </Typography>
            <IconButton
              aria-label="delete"
              onClick={handleDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#96281b',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </CardContent>
          <Typography variant="body2" color="text.secondary" onClick={navigateToPipeline} sx={{ padding: '0 16px 16px' }}>
            {isFolder ? 'Click to open folder' : 'Click to modify the pipeline'}
          </Typography>
        </CardActionArea>
      </Card>
    </div>
  );
}