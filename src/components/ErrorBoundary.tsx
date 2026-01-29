import { Alert, Box, Button, Container, Paper, Typography } from '@mui/material';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('💥 ErrorBoundary caught error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md" sx={{ py: 8 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 3, md: 6 },
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            border: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="h3" sx={{ mb: 3 }}>
                            ⚠️
                        </Typography>

                        <Typography variant="h5" fontWeight="600" gutterBottom>
                            Algo deu errado
                        </Typography>

                        <Alert severity="error" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
                            <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {this.state.error?.message || 'Erro desconhecido'}
                            </Typography>
                        </Alert>

                        <Button
                            variant="contained"
                            onClick={this.handleReload}
                            sx={{ mt: 2 }}
                        >
                            Recarregar Página
                        </Button>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
                                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.65rem' }}>
                                    {this.state.errorInfo.componentStack}
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
