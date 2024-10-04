import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CardActionArea, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setActivePipeline } from '../../redux/slices/pipelineSlice';

export interface PipelineCardProps {
  id: string;
  name: string;
  imgData: string;
  onDelete: (id: string) => void;
}

export default function MediaCard({ id, name, imgData, onDelete }: PipelineCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToPipeline = () => {
    dispatch(setActivePipeline(id));
    navigate('/pipeline');
  };
  const handleDelete = () => {
    onDelete(id); 
  };
  

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          sx={{ height: 140 }}
          title="green iguana"
          image={imgData}
          onClick={navigateToPipeline}
        />
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography gutterBottom variant="h5" component="div" onClick={navigateToPipeline}>
            {name}
          </Typography>
          <IconButton
            aria-label="delete"
            onClick={handleDelete}
            sx={{ color: 'red' }}
          ></IconButton>
          <DeleteIcon 
            aria-label="delete"
            onClick={handleDelete}
            sx={{ color: '#96281b' }}
          />  
        </CardContent>
        <Typography variant="body2" color="text.secondary" onClick={navigateToPipeline}>
            Click this to modify the pipeline
          </Typography >
      </CardActionArea>
    </Card>
  );

  
}