import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActivePipeline } from '../../redux/slices/pipelineSlice';
import { useDrag, useDrop } from 'react-dnd';
import SourceIcon from '@mui/icons-material/Source';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useRef } from "react";
import { updatePipelineName } from "../../redux/slices/pipelineSlice";

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
  const [isEditing, setIsEditing] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);
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

  const handleStartEditing = () => {
    dispatch(setActivePipeline(id));
    setIsEditing(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    textFieldRef.current?.blur();
  };

  const setPipelineName = (name: string) => {
    dispatch(updatePipelineName(name))
  }

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
    <div ref={(node) => !isEditing && drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
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
            title={isEditing ? undefined : name}
            onClick={isEditing ? undefined : navigateToPipeline}
          >
            {isEditing ? (
              <TextField
                value={name}
                onChange={(event) => setPipelineName(event?.target.value as string)}
                autoFocus
                onBlur={handleFinishEditing}
                inputProps={{ style: { textAlign: 'center', width: 'auto' } }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleFinishEditing();
                  }
                }}
                inputRef={textFieldRef} 
              />
            ) : (
              isFolder ? (
                <SourceIcon sx={{ fontSize: 64, color: '#1976d2' }} />
              ) : (
                <img src={imgData} alt={name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              )
            )}
          </CardMedia>
          <CardContent>
            <Typography 
              gutterBottom 
              variant="h5" 
              component="div" 
              onClick={!isEditing ? navigateToPipeline : undefined} 
            >
              {name}
            </Typography>
            <IconButton
              aria-label="rename"
              onClick={handleStartEditing}
              sx={{
                position: 'absolute',
                top: 52,
                right: 8,
                color: '#96281b',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <EditIcon />
            </IconButton>
            {!isEditing && ( 
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
            )}
          </CardContent>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            onClick={!isEditing ? navigateToPipeline : undefined} 
            sx={{ padding: '0 16px 16px' }}
          >
            {isFolder ? 'Click to open folder' : 'Click to modify the pipeline'}
          </Typography>
        </CardActionArea>
      </Card>
    </div>
  );
  
}