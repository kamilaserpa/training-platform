import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import { ExerciseVideo } from 'components/ExerciseVideo';
import { signedUrlCache } from 'services/privateVideoStorage';

function ExerciseCard({ exercise }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (exercise.video_path) {
        try {
          const url = await signedUrlCache.getOrCreate(exercise.video_path);
          setVideoUrl(url);
        } catch (error) {
          console.error('Erro ao carregar vídeo:', error);
        }
      }
    };
    loadVideo();
  }, [exercise.video_path]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {exercise.name}
        </Typography>

        {/* Vídeo demonstrativo */}
        {videoUrl && (
          <Box mb={2}>
            <ExerciseVideo
              videoUrl={videoUrl}
              alt={`Demonstração: ${exercise.name}`}
            />
          </Box>
        )}

        {/* Descrição e outros detalhes */}
        <Typography variant="body2" color="text.secondary">
          {exercise.description}
        </Typography>

        {exercise.movement_pattern && (
          <Chip
            label={exercise.movement_pattern.name}
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </CardContent>
    </Card>
  );
}

