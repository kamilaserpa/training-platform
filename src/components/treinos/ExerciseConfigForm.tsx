import {
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
// 
import { useEffect, useState } from 'react';
import { ExerciseVideo } from '../../components/ExerciseVideo';
import { supabase } from '../../lib/supabase';
import type { Exercise, Video } from '../../types/database.types';

export interface ExerciseConfig {
    series: number;
    repetitions: string;
    weight_kg: string;
    duration_seconds: number | null;
    rest_seconds: number | null;
    notes: string;
    // Campos calculados
    tempoTotal?: number;
}

interface ExerciseConfigFormProps {
    exercise: Exercise;
    video: Video | null;
    initialValues?: Partial<ExerciseConfig>;
    onChange: (config: ExerciseConfig) => void;
}

export const ExerciseConfigForm = ({
    exercise,
    video,
    initialValues,
    onChange,
}: ExerciseConfigFormProps) => {
    // Calcular tempo total inicial
    const calculateTempoTotal = (series: number, duracao: number | null, intervalo: number | null) => {
        if (!series || !duracao || !intervalo) return 0;
        return series > 0 ? (duracao + intervalo) * series : 0;
    };

    // Usar valores iniciais se fornecidos, senão usar padrões apenas para criação
    const initialSeries = initialValues?.series ?? 3;
    const initialDuration = initialValues?.duration_seconds ?? null; // Sem valor padrão
    const initialRest = initialValues?.rest_seconds ?? null; // Sem valor padrão
    const initialRepetitions = initialValues?.repetitions ?? '';
    const initialWeight = initialValues?.weight_kg ?? '';
    const initialNotes = initialValues?.notes ?? '';

    const [config, setConfig] = useState<ExerciseConfig>({
        series: initialSeries,
        repetitions: initialRepetitions,
        weight_kg: initialWeight,
        duration_seconds: initialDuration,
        rest_seconds: initialRest,
        notes: initialNotes,
        tempoTotal: calculateTempoTotal(initialSeries, initialDuration, initialRest),
    });

    // Atualizar config quando initialValues mudar (importante para reutilização do modal)
    useEffect(() => {
        if (initialValues) {
            const newSeries = initialValues.series ?? 3;
            const newDuration = initialValues.duration_seconds ?? null;
            const newRest = initialValues.rest_seconds ?? null; // Sem valor padrão
            const newRepetitions = initialValues.repetitions ?? '';
            const newWeight = initialValues.weight_kg ?? '';
            const newNotes = initialValues.notes ?? '';

            const newConfig = {
                series: newSeries,
                repetitions: newRepetitions,
                weight_kg: newWeight,
                duration_seconds: newDuration,
                rest_seconds: newRest,
                notes: newNotes,
                tempoTotal: calculateTempoTotal(newSeries, newDuration, newRest),
            };

            setConfig(newConfig);
            onChange(newConfig);
        }
    }, [initialValues, onChange]);

    const handleChange = (field: keyof ExerciseConfig, value: any) => {
        const newConfig = { ...config, [field]: value };

        // Recalcular tempo total quando séries, duração ou descanso mudarem
        if (field === 'series' || field === 'duration_seconds' || field === 'rest_seconds') {
            const series = field === 'series' ? value : newConfig.series;
            const duration = field === 'duration_seconds' ? value : newConfig.duration_seconds;
            const rest = field === 'rest_seconds' ? value : newConfig.rest_seconds;

            newConfig.tempoTotal = calculateTempoTotal(series || 0, duration, rest || 0);
        }

        setConfig(newConfig);
        onChange(newConfig);
    };

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const loadPreview = async () => {
            if (!video?.storage_path) {
                setPreviewUrl(null);
                return;
            }
            try {
                const { data, error } = await supabase.storage
                    .from('exercise-videos')
                    .createSignedUrl(video.storage_path, 86400);
                if (error) throw error;
                if (active) setPreviewUrl(data.signedUrl);
            } catch (e) {
                if (active) setPreviewUrl(null);
            }
        };
        loadPreview();
        return () => {
            active = false;
        };
    }, [video?.storage_path]);

    return (
        <Box>
            <Card sx={{ mb: 3, bgcolor: 'primary.lighter', border: '1px solid', borderColor: 'primary.main' }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={7}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Exercício Selecionado
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                {exercise.name}
                            </Typography>
                            {video && (
                                <Typography variant="body2" color="text.secondary">
                                    Vídeo: {video.title}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={5}>
                            <Box sx={{ width: '100%', borderRadius: 1, overflow: 'hidden' }}>
                                {previewUrl ? (
                                    <ExerciseVideo
                                        videoUrl={previewUrl}
                                        autoPlay={false}
                                        loop={false}
                                        muted
                                        showControls={false}
                                        height={160}
                                    />
                                ) : (
                                    <Box sx={{
                                        width: '100%',
                                        height: 160,
                                        bgcolor: 'background.default',
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'text.secondary',
                                    }}>
                                        {video ? 'Carregando prévia do vídeo...' : 'Nenhum vídeo selecionado'}
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Formulário de Configuração - Reproduzindo campos do dialog simples */}
            <Grid container spacing={4} mt={2}>
                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        label="Séries"
                        type="number"
                        value={config.series || ''}
                        onChange={(e) => handleChange('series', parseInt(e.target.value) || 0)}
                        fullWidth
                        inputProps={{ min: 1 }}
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        label="Repetições"
                        value={config.repetitions || ''}
                        onChange={(e) => handleChange('repetitions', e.target.value)}
                        placeholder="Ex: 8-10"
                        fullWidth
                        helperText="Ex: 12, 10-12, ou máximo"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        label="Carga"
                        value={config.weight_kg || ''}
                        onChange={(e) => handleChange('weight_kg', e.target.value)}
                        placeholder="Ex: 80kg ou Corporal"
                        fullWidth
                        helperText="Ex: 80kg, Corporal, ou deixe vazio"
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        label="Tempo (seg)"
                        type="number"
                        value={config.duration_seconds || ''}
                        onChange={(e) => handleChange('duration_seconds', e.target.value ? parseInt(e.target.value) : null)}
                        fullWidth
                        helperText="Duração de cada série em segundos"
                        inputProps={{ min: 0 }}
                    />
                </Grid>

                <Grid item xs={12} sm={4} md={4}>
                    <TextField
                        label="Intervalo (seg)"
                        type="number"
                        value={config.rest_seconds || ''}
                        onChange={(e) => handleChange('rest_seconds', parseInt(e.target.value) || 0)}
                        fullWidth
                        helperText="Descanso entre séries em segundos"
                        inputProps={{ min: 0 }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Tempo Total"
                        value={config.tempoTotal || 0}
                        fullWidth
                        disabled
                        helperText="Calculado automaticamente: (Tempo + Intervalo) × Séries"
                        InputProps={{
                            endAdornment: <span style={{ color: '#666', fontSize: '0.875rem' }}>segundos</span>
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Observações"
                        value={config.notes || ''}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Ex: Cadência 3-0-1, amplitude completa..."
                        fullWidth
                        multiline
                        rows={3}
                        helperText="Informações adicionais sobre a execução"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};
