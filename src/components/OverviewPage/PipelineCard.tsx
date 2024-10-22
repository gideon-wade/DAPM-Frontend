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

const ItemType = 'CARD';

export interface PipelineCardProps {
  id: string;
  name: string;
  imgData: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (id: string) => void;

}

export default function MediaCard({ id, name, imgData, index, moveCard, onDelete }: PipelineCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navigateToPipeline = () => {
    dispatch(setActivePipeline(id));
    navigate('/pipeline');
  };
  const handleDelete = () => {
    onDelete(id); 
  };
  const [, ref] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }) {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index; 
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))}>
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
          </Typography>
        </CardActionArea>
      </Card>
    </div>
  );
}