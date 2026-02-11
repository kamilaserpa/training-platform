import type { ReactNode } from 'react'

import {
    Box,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material'

import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
} from '@mui/icons-material'

type KeyGetter<T> = (item: T, index: number) => string | number

type RenderNode<T> = (item: T, index: number) => ReactNode

type RenderText<T> = (item: T, index: number) => ReactNode

export type TrainingBlockSectionProps<T> = {
    title?: string | ReactNode
    headerLeft?: ReactNode

    items: T[]

    emptyPrimary: ReactNode
    emptySecondary?: ReactNode

    dense?: boolean
    listSx?: any

    onAdd: () => void
    addAriaLabel?: string
    onEdit?: (index: number, item: T) => void
    onDelete: (index: number, item: T) => void

    disableAdd?: boolean
    disableItemActions?: boolean

    getKey?: KeyGetter<T>
    renderLeading?: RenderNode<T>
    renderPrimary: RenderText<T>
    renderSecondary?: RenderText<T>
}

export function TrainingBlockSection<T>(props: TrainingBlockSectionProps<T>) {
    const {
        title,
        headerLeft,
        items,
        emptyPrimary,
        emptySecondary,
        dense,
        listSx,
        onAdd,
        addAriaLabel,
        onEdit,
        onDelete,
        disableAdd,
        disableItemActions,
        getKey,
        renderLeading,
        renderPrimary,
        renderSecondary,
    } = props

    const headerLeftNode =
        headerLeft ??
        (typeof title === 'string' ? (
            <Typography variant="subtitle1" fontWeight="600">
                {title}
            </Typography>
        ) : (
            title
        ))

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>{headerLeftNode}</Box>
                <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1} sx={{ flexWrap: 'nowrap' }}>
                    <Tooltip title="Adicionar Exercício" arrow>
                        <Button
                            size="small"
                            onClick={onAdd}
                            disabled={disableAdd}
                            aria-label={addAriaLabel ?? 'Adicionar exercício'}
                            variant="contained"
                            color="primary"
                            sx={{
                                minWidth: 'auto',
                                width: '40px',
                                height: '40px',
                                p: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <AddIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                </Stack>
            </Box>

            <List dense={dense} sx={{ bgcolor: 'grey.50', borderRadius: 1, ...listSx }}>
                {items.length === 0 ? (
                    <ListItem>
                        <ListItemText primary={emptyPrimary} secondary={emptySecondary} />
                    </ListItem>
                ) : (
                    items.map((item, index) => (
                        <ListItem
                            key={getKey ? getKey(item, index) : index}
                            secondaryAction={
                                <Stack direction="row" spacing={0.5}>
                                    {onEdit && (
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={() => onEdit(index, item)}
                                            disabled={disableItemActions}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => onDelete(index, item)}
                                        aria-label="Excluir exercício"
                                        disabled={disableItemActions}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            }
                        >
                            {renderLeading ? renderLeading(item, index) : null}
                            <ListItemText
                                primary={renderPrimary(item, index)}
                                secondary={renderSecondary ? renderSecondary(item, index) : undefined}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </>
    )
}
