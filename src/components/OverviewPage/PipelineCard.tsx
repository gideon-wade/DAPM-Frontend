import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
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
          title={name}
          image={imgData}
          onClick={navigateToPipeline}
        />
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
        <Typography variant="body2" color="text.secondary" onClick={navigateToPipeline}>
            Click this to modify the pipeline
          </Typography >
      </CardActionArea>
    </Card>
  );
}