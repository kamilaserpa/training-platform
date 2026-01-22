import { CheckCircle as CheckIcon } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Video } from '../../types/database.types';

// Types para os enums
type VideoLevel = 'beginner' | 'intermediate' | 'advanced';
type VideoPlane = 'frontal' | 'lateral' | 'dorsal' | 'detail';
type VideoType = 'demo' | 'education';
type VideoGenre = 'strength' | 'cardio' | 'mobility' | 'core' | 'balance' | 'flexibility' | 'power' | 'endurance';

interface VideoSelectorProps {
    exerciseId: string;
    onSelect: (video: Video) => void;
    selectedVideoId?: string;
}

interface VideoWithUrl extends Video {
    previewUrl?: string;
}

export const VideoSelector = ({ exerciseId, onSelect, selectedVideoId }: VideoSelectorProps) => {
    const [videos, setVideos] = useState<VideoWithUrl[]>([]);
    const [filteredVideos, setFilteredVideos] = useState<VideoWithUrl[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
    const selectedCardRef = useRef<HTMLDivElement | null>(null);

    // Filtros
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<VideoLevel | ''>('');
    const [planeFilter, setPlaneFilter] = useState<VideoPlane | ''>('');
    const [typeFilter, setTypeFilter] = useState<VideoType | ''>('');
    const [genreFilter, setGenreFilter] = useState<VideoGenre | ''>('');

    useEffect(() => {
        loadVideos();
    }, [exerciseId]);

    useEffect(() => {
        applyFilters();
    }, [search, levelFilter, planeFilter, typeFilter, genreFilter, videos]);

    // Scroll automático para o vídeo selecionado
    useEffect(() => {
        if (selectedVideoId && selectedCardRef.current) {
            setTimeout(() => {
                selectedCardRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            }, 100);
        }
    }, [selectedVideoId, filteredVideos]);

    // Intersection Observer para auto-pause de vídeos fora da tela
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const video = entry.target as HTMLVideoElement;
                    if (entry.isIntersecting) {
                        video.play().catch(() => { });
                    } else {
                        video.pause();
                    }
                });
            },
            { threshold: 0.5 }
        );

        Object.values(videoRefs.current).forEach((video) => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [filteredVideos]);

    const loadVideos = async () => {
        try {
            setLoading(true);

            // Buscar todos os vídeos disponíveis (não filtrado por exercício)
            const { data: videosData, error: videosError } = await supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });

            if (videosError) throw videosError;

            // Gerar URLs assinadas para cada vídeo
            const videosWithUrls = await Promise.all(
                (videosData || []).map(async (video) => {
                    try {
                        const { data, error } = await supabase.storage
                            .from('exercise-videos')
                            .createSignedUrl(video.storage_path, 86400);

                        if (error) throw error;

                        return {
                            ...video,
                            previewUrl: data.signedUrl,
                        };
                    } catch (err) {
                        console.error(`Erro ao gerar URL para vídeo ${video.id}:`, err);
                        return video;
                    }
                })
            );

            setVideos(videosWithUrls);
            setFilteredVideos(videosWithUrls);
        } catch (err: any) {
            console.error('Erro ao carregar vídeos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...videos];

        if (search.trim()) {
            filtered = filtered.filter(v =>
                v.title.toLowerCase().includes(search.toLowerCase()) ||
                v.description?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (levelFilter) {
            filtered = filtered.filter(v => v.level === levelFilter);
        }

        if (planeFilter) {
            filtered = filtered.filter(v => v.plane === planeFilter);
        }

        if (typeFilter) {
            filtered = filtered.filter(v => v.type === typeFilter);
        }

        if (genreFilter) {
            filtered = filtered.filter(v => v.genre === genreFilter);
        }

        setFilteredVideos(filtered);
    };

    const clearFilters = () => {
        setSearch('');
        setLevelFilter('');
        setPlaneFilter('');
        setTypeFilter('');
        setGenreFilter('');
    };

    const getLevelLabel = (level: string) => {
        const labels: Record<string, string> = {
            beginner: 'Iniciante',
            intermediate: 'Intermediário',
            advanced: 'Avançado',
        };
        return labels[level] || level;
    };

    const getPlaneLabel = (plane: string) => {
        const labels: Record<string, string> = {
            frontal: 'Frontal',
            lateral: 'Lateral',
            dorsal: 'Dorsal',
            detail: 'Detalhe',
        };
        return labels[plane] || plane;
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            demo: 'Demonstração',
            education: 'Educativo',
        };
        return labels[type] || type;
    };

    const getGenreLabel = (genre: string) => {
        const labels: Record<string, string> = {
            strength: 'Força',
            cardio: 'Cardio',
            mobility: 'Mobilidade',
            core: 'Core',
            balance: 'Equilíbrio',
            flexibility: 'Flexibilidade',
            power: 'Potência',
            endurance: 'Resistência',
        };
        return labels[genre] || genre;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box>
            {/* Informação sobre vídeo atual */}
            {selectedVideoId && videos.find(v => v.id === selectedVideoId) && (
                <Alert
                    severity="info"
                    sx={{ mb: 2 }}
                    icon={<CheckIcon />}
                >
                    <Typography variant="body2" fontWeight={600}>
                        Vídeo atual: {videos.find(v => v.id === selectedVideoId)?.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Selecione outro vídeo abaixo para alterá-lo, ou clique em "Pular Vídeo" para remover.
                    </Typography>
                </Alert>
            )}

            {/* Filtros */}
            <Grid container spacing={{ xs: 4, sm: 2 }} mb={3}>
                <Grid item xs={12} sm={8}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Buscar por título ou descrição..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <TextField
                        fullWidth
                        select
                        size="small"
                        label="Nível"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value as VideoLevel | '')}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="beginner">Iniciante</MenuItem>
                        <MenuItem value="intermediate">Intermediário</MenuItem>
                        <MenuItem value="advanced">Avançado</MenuItem>
                    </TextField>
                </Grid>

                {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Plano"
              value={planeFilter}
              onChange={(e) => setPlaneFilter(e.target.value as VideoPlane | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="frontal">Frontal</MenuItem>
              <MenuItem value="lateral">Lateral</MenuItem>
              <MenuItem value="dorsal">Dorsal</MenuItem>
              <MenuItem value="detail">Detalhe</MenuItem>
            </TextField>
          </Grid> */}

                {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as VideoType | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="demo">Demonstração</MenuItem>
              <MenuItem value="education">Educativo</MenuItem>
            </TextField>
          </Grid> */}

                {/* <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              size="small"
              label="Gênero"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value as VideoGenre | '')}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="strength">Força</MenuItem>
              <MenuItem value="cardio">Cardio</MenuItem>
              <MenuItem value="mobility">Mobilidade</MenuItem>
              <MenuItem value="core">Core</MenuItem>
              <MenuItem value="balance">Equilíbrio</MenuItem>
              <MenuItem value="flexibility">Flexibilidade</MenuItem>
              <MenuItem value="power">Potência</MenuItem>
              <MenuItem value="endurance">Resistência</MenuItem>
            </TextField>
          </Grid> */}

                <Box display="flex" justifyContent="flex-end">
                    <Button size="small" onClick={clearFilters}>
                        Limpar Filtros
                    </Button>
                </Box>
            </Grid>

            {/* Grid de Vídeos */}
            {filteredVideos.length === 0 ? (
                <Box p={3} textAlign="center">
                    <Typography color="text.secondary">
                        Nenhum vídeo encontrado para este exercício
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ maxHeight: 500, overflow: 'auto' }}>
                    {filteredVideos.map((video) => {
                        const isSelected = selectedVideoId === video.id;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={video.id}>
                                <Card
                                    ref={isSelected ? selectedCardRef : null}
                                    sx={{
                                        position: 'relative',
                                        border: isSelected ? 3 : 1,
                                        borderColor: isSelected ? 'primary.main' : 'divider',
                                        boxShadow: isSelected ? 6 : 1,
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'all 0.3s ease',
                                        bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'scale(1.02)',
                                        },
                                    }}
                                >
                                    {/* Badge de "Vídeo Atual" */}
                                    {isSelected && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                left: 8,
                                                zIndex: 10,
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: 1,
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                textTransform: 'uppercase',
                                                boxShadow: 2,
                                            }}
                                        >
                                            🎬 Vídeo Atual
                                        </Box>
                                    )}
                                    <CardActionArea onClick={() => onSelect(video)}>
                                        {/* Preview do Vídeo */}
                                        {video.previewUrl && (
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    paddingTop: '56.25%', // 16:9 aspect ratio
                                                    backgroundColor: 'grey.900',
                                                }}
                                            >
                                                <video
                                                    ref={(el) => (videoRefs.current[video.id] = el)}
                                                    src={video.previewUrl}
                                                    loop
                                                    muted
                                                    playsInline
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                                {isSelected && (
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            bgcolor: 'rgba(25, 118, 210, 0.2)',
                                                            border: '4px solid',
                                                            borderColor: 'primary.main',
                                                        }}
                                                    >
                                                        <CheckIcon
                                                            sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                color: 'primary.main',
                                                                fontSize: 64,
                                                                bgcolor: 'white',
                                                                borderRadius: '50%',
                                                                p: 1,
                                                                boxShadow: 3,
                                                            }}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        <CardContent>
                                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                                {video.title}
                                            </Typography>

                                            {video.description && (
                                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                                    {video.description}
                                                </Typography>
                                            )}

                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                                <Chip label={getLevelLabel(video.level || '')} size="small" />
                                                <Chip label={getPlaneLabel(video.plane || '')} size="small" variant="outlined" />
                                                <Chip label={getTypeLabel(video.type || '')} size="small" variant="outlined" />
                                                <Chip label={getGenreLabel(video.genre || '')} size="small" color="primary" />
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};
