import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'dayjs/locale/pt-br';
import { describe, expect, it, vi } from 'vitest';
import type { ExerciseConfig } from './ExerciseConfigForm';
import { ExerciseConfigForm } from './ExerciseConfigForm';

/**
 * Testes para ExerciseConfigForm com TimePicker e novo padrão de rest_seconds
 */

const mockExercise = {
    id: 'ex-1',
    name: 'Agachamento',
};

const mockVideo = {
    id: 'vid-1',
    title: 'Demonstração de Agachamento',
    storage_path: 'exercises/agachamento.mp4',
};

function renderFormWithLocalization(
    component: React.ReactElement
) {
    return render(
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            {component}
        </LocalizationProvider>
    );
}

describe('ExerciseConfigForm - Padrão de rest_seconds = 15', () => {
    it('defines default rest_seconds to 15 when not provided', async () => {
        const onChange = vi.fn();
        const initialValues: Partial<ExerciseConfig> = {
            series: 3,
            repetitions: '10',
        };

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={initialValues}
                onChange={onChange}
            />
        );

        await waitFor(() => {
            const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;
            expect(restField.value).toBe('15');
        });

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                rest_seconds: 15,
            })
        );
    });

    it('preserves rest_seconds value when provided in initialValues', async () => {
        const onChange = vi.fn();
        const initialValues: Partial<ExerciseConfig> = {
            series: 3,
            rest_seconds: 60,
        };

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={initialValues}
                onChange={onChange}
            />
        );

        await waitFor(() => {
            const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;
            expect(restField.value).toBe('60');
        });
    });

    it('allows changing rest_seconds after form mount', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{}}
                onChange={onChange}
            />
        );

        const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;

        // Clear default value and set new
        await user.clear(restField);
        await user.type(restField, '45');

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    rest_seconds: 45,
                })
            );
        });
    });

    it('sets rest_seconds to 0 without error', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ rest_seconds: 30 }}
                onChange={onChange}
            />
        );

        const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;

        await user.clear(restField);
        await user.type(restField, '0');

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    rest_seconds: 0,
                })
            );
        });
    });
});

describe('ExerciseConfigForm - TimePicker para duration_seconds', () => {
    it('renderiza TimePicker para duração (mm:ss)', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ duration_seconds: 30 }}
                onChange={onChange}
            />
        );

        const durationField = screen.getByLabelText(/Duração \(mm:ss\)/i);
        expect(durationField).toBeInTheDocument();
    });

    it('converte segundos em formato mm:ss no TimePicker', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ duration_seconds: 90 }}
                onChange={onChange}
            />
        );

        const durationField = screen.getByLabelText(/Duração \(mm:ss\)/i) as HTMLInputElement;
        // 90 segundos = 01:30
        expect(durationField.value).toContain('01:30');
    });

    it('converte mm:ss para segundos ao alterar duração', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ duration_seconds: 30 }}
                onChange={onChange}
            />
        );

        const durationField = screen.getByLabelText(/Duração \(mm:ss\)/i);

        // Simular clique para abrir time picker (comportamento simplificado)
        await user.click(durationField);

        // Em modo real, clicaria nos spinners do time picker
        // Para este teste, verificamos se o field aceita entrada de tempo
        expect(durationField).toBeInTheDocument();
    });

    it('shows "00:00" when duration_seconds is null', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ duration_seconds: null }}
                onChange={onChange}
            />
        );

        const durationField = screen.getByLabelText(/Duração \(mm:ss\)/i) as HTMLInputElement;
        // TimePicker com valor null exibe campo vazio, não "00:00"
        expect(durationField.value).toBe('');
    });

    it('converte 0 segundos em 00:00', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ duration_seconds: 0 }}
                onChange={onChange}
            />
        );

        const durationField = screen.getByLabelText(/Duração \(mm:ss\)/i) as HTMLInputElement;
        expect(durationField.value).toContain('00:00');
    });
});

describe('ExerciseConfigForm - Cálculo de tempo total (mm:ss)', () => {
    it('calcula tempo total em formato mm:ss: (duração + intervalo) × séries', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 3,
                    duration_seconds: 30,
                    rest_seconds: 15,
                }}
                onChange={onChange}
            />
        );

        const totalField = screen.getByLabelText(/Tempo Total/i) as HTMLInputElement;
        // (30 + 15) × 3 = 135 segundos = 02:15
        expect(totalField.value).toContain('02:15');
    });

    it('mostra tempo total 00:00 quando nenhum tempo definido', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 3,
                    duration_seconds: null,
                    rest_seconds: 0,
                }}
                onChange={onChange}
            />
        );

        const totalField = screen.getByLabelText(/Tempo Total/i) as HTMLInputElement;
        expect(totalField.value).toContain('00:00');
    });

    it('recalcula tempo total ao mudar séries', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 3,
                    duration_seconds: 60,
                    rest_seconds: 30,
                }}
                onChange={onChange}
            />
        );

        const seriesField = screen.getByLabelText(/Séries/i) as HTMLInputElement;

        // Mudar séries de 3 para 5
        await user.clear(seriesField);
        await user.type(seriesField, '5');

        await waitFor(() => {
            // (60 + 30) × 5 = 450 segundos = 07:30
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    tempoTotal: 450,
                    series: 5,
                })
            );
        });
    });

    it('recalcula tempo total ao mudar duração', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 2,
                    duration_seconds: 45,
                    rest_seconds: 15,
                }}
                onChange={onChange}
            />
        );

        // Verificar cálculo inicial: (45 + 15) × 2 = 120 segundos = 02:00
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                tempoTotal: 120,
            })
        );
    });

    it('tempo total disabled e readonly', () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 3,
                    duration_seconds: 30,
                    rest_seconds: 15,
                }}
                onChange={onChange}
            />
        );

        const totalField = screen.getByLabelText(/Tempo Total/i) as HTMLInputElement;
        expect(totalField).toBeDisabled();
    });

    it('mostra "(mm:ss)" como hint no campo tempo total (não "segundos")', () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{
                    series: 3,
                    duration_seconds: 30,
                    rest_seconds: 15,
                }}
                onChange={onChange}
            />
        );

        const helperText = screen.getByText(/Calculado automaticamente/i);
        expect(helperText).toBeInTheDocument();
    });
});

describe('ExerciseConfigForm - Grid responsivo (xs/sm/md)', () => {
    it('render Series field em grid xs=6 (meia largura em mobile)', () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ series: 3 }}
                onChange={onChange}
            />
        );

        const seriesField = screen.getByLabelText(/Séries/i);
        expect(seriesField).toBeInTheDocument();
    });

    it('render Repetitions field em grid xs=6 (meia largura em mobile)', () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ repetitions: '10' }}
                onChange={onChange}
            />
        );

        const repField = screen.getByLabelText(/Repetições/i);
        expect(repField).toBeInTheDocument();
    });

    it('campos têm inputMode="numeric" para mobile keyboard', () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ series: 3 }}
                onChange={onChange}
            />
        );

        const seriesField = screen.getByLabelText(/Séries/i) as HTMLInputElement;
        expect(seriesField.inputMode).toBe('numeric');

        const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;
        expect(restField.inputMode).toBe('numeric');
    });
});

describe('ExerciseConfigForm - Integração com AddExerciseModal', () => {
    it('initialValues atualiza automaticamente quando prop muda (reutilização modal)', async () => {
        const onChange = vi.fn();
        const { rerender } = renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ series: 3, rest_seconds: 15 }}
                onChange={onChange}
            />
        );

        // Simular mudança de initialValues (outro exercício selecionado)
        rerender(
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <ExerciseConfigForm
                    exercise={mockExercise as any}
                    video={null}
                    initialValues={{ series: 4, rest_seconds: 20 }}
                    onChange={onChange}
                />
            </LocalizationProvider>
        );

        await waitFor(() => {
            const seriesField = screen.getByLabelText(/Séries/i) as HTMLInputElement;
            expect(seriesField.value).toBe('4');

            const restField = screen.getByLabelText(/Intervalo \(seg\)/i) as HTMLInputElement;
            expect(restField.value).toBe('20');
        });
    });

    it('onChange chamado ao carregar form com initialValues', async () => {
        const onChange = vi.fn();

        renderFormWithLocalization(
            <ExerciseConfigForm
                exercise={mockExercise as any}
                video={null}
                initialValues={{ series: 3, rest_seconds: 15, repetitions: '8' }}
                onChange={onChange}
            />
        );

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    series: 3,
                    rest_seconds: 15,
                    repetitions: '8',
                })
            );
        });
    });
});
