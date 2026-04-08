import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import FormSelect from './FormSelect';

/**
 * Testes para FormSelect com suporte a cores em opções
 */

function FormSelectTestWrapper({
    options,
    name = 'test-select',
    label = 'Teste Select',
    required,
}: {
    options: Array<{ id: string; label: string; color_hex?: string }>;
    name?: string;
    label?: string;
    required?: boolean;
}) {
    const methods = useForm({
        defaultValues: {
            [name]: '',
        },
    });

    return (
        <FormProvider {...methods}>
            <FormSelect name={name} label={label} options={options} required={required} />
        </FormProvider>
    );
}

describe('FormSelect com cores', () => {
    it('renderiza FormSelect com opções simples (sem cores)', async () => {
        const options = [
            { id: '1', label: 'Opção 1' },
            { id: '2', label: 'Opção 2' },
        ];

        render(<FormSelectTestWrapper options={options} />);

        const select = screen.getByRole('combobox', { name: /Teste Select/i });
        expect(select).toBeInTheDocument();
    });

    it('renderiza FormSelect com opções que possuem cores', async () => {
        const options = [
            { id: '1', label: 'Hipertrofia', color_hex: '#3B82F6' },
            { id: '2', label: 'Força', color_hex: '#EF4444' },
        ];

        const user = userEvent.setup();

        render(<FormSelectTestWrapper options={options} />);

        const select = screen.getByRole('combobox', { name: /Teste Select/i });
        await user.click(select);

        // Verificar se as opções aparecem no menu
        expect(await screen.findByRole('option', { name: /Hipertrofia/i })).toBeInTheDocument();
        expect(await screen.findByRole('option', { name: /Força/i })).toBeInTheDocument();
    });

    it('permite selecionar uma opção com cor', async () => {
        const options = [
            { id: 'opt1', label: 'Deload', color_hex: '#8B5CF6' },
        ];

        const user = userEvent.setup();

        render(<FormSelectTestWrapper options={options} />);

        const select = screen.getByRole('combobox', { name: /Teste Select/i });
        await user.click(select);

        const option = await screen.findByRole('option', { name: /Deload/i });
        await user.click(option);

        // Após seleção, verificar que o texto da opção está visível no select
        expect(screen.getByText('Deload')).toBeInTheDocument();
    });

    it('mostra "Nenhum" como primeira opção (vazia)', async () => {
        const options = [{ id: '1', label: 'Opção 1' }];

        const user = userEvent.setup();

        render(<FormSelectTestWrapper options={options} />);

        const select = screen.getByRole('combobox', { name: /Teste Select/i });
        await user.click(select);

        expect(await screen.findByText('Nenhum')).toBeInTheDocument();
    });

    it('mistura opções com e sem cores sem erro', async () => {
        const options = [
            { id: '1', label: 'Com Cor', color_hex: '#3B82F6' },
            { id: '2', label: 'Sem Cor' },
            { id: '3', label: 'Outra Cor', color_hex: '#EF4444' },
        ];

        const user = userEvent.setup();

        render(<FormSelectTestWrapper options={options} />);

        const select = screen.getByRole('combobox', { name: /Teste Select/i });
        await user.click(select);

        expect(await screen.findByRole('option', { name: /Com Cor/i })).toBeInTheDocument();
        expect(await screen.findByRole('option', { name: /Sem Cor/i })).toBeInTheDocument();
        expect(await screen.findByRole('option', { name: /Outra Cor/i })).toBeInTheDocument();
    });

    // it('exibe asterisco quando required=true', () => {
    //     const options = [{ id: '1', label: 'Opção' }];

    //     render(
    //         <FormProvider {...useForm()}>
    //             <FormSelect name="test" label="Campo Obrigatório" options={options} required />
    //         </FormProvider>
    //     );

    //     // O asterisco está no label junto com o texto
    //     const label = screen.getByText(/Campo Obrigatório/);
    //     expect(label).toBeInTheDocument();
    //     expect(label.textContent).toContain('*');
    // });

    // it('exibe mensagem de erro quando há validação', async () => {
    //     const options = [{ id: '1', label: 'Opção' }];

    //     const methods = useForm({
    //         defaultValues: { test: '' },
    //         mode: 'onChange',
    //     });

    //     const { rerender } = render(
    //         <FormProvider {...methods}>
    //             <FormSelect name="test" label="Teste" options={options} required={false} />
    //         </FormProvider>
    //     );

    //     // Setar erro e forçar re-render
    //     methods.setError('test', { message: 'Campo obrigatório' });

    //     rerender(
    //         <FormProvider {...methods}>
    //             <FormSelect name="test" label="Teste" options={options} required={false} />
    //         </FormProvider>
    //     );

    //     expect(await screen.findByText('Campo obrigatório')).toBeInTheDocument();
    // });

    // it('evita seleção de valor fora do range de opções', async () => {
    //     const options = [
    //         { id: '1', label: 'Opção 1' },
    //         { id: '2', label: 'Opção 2' },
    //     ];

    //     const methods = useForm({
    //         defaultValues: { test: 'invalid-id' }, // ID que não existe nas opções
    //     });

    //     render(
    //         <FormProvider {...methods}>
    //             <FormSelect name="test" label="Teste" options={options} required={false} />
    //         </FormProvider>
    //     );

    //     // Quando valor inválido, componente deve mostrar "Nenhum" (valor vazio)
    //     const select = screen.getByRole('combobox');
    //     expect(select).toBeInTheDocument();
    //     // Verifica que "Nenhum" está sendo mostrado (valor padrão quando inválido)
    //     expect(screen.getByText('Nenhum')).toBeInTheDocument();
    // });
});
