import { GetApp as GetAppIcon } from '@mui/icons-material';
import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallCard = () => {
    const { canInstall, installApp } = usePWAInstall();
    const [isMobile, setIsMobile] = useState(false);
    const [isIosSafari, setIsIosSafari] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const update = () => setIsMobile(window.innerWidth < 768);
        update();

        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const ua = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(ua);
        const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
        setIsIosSafari(isIos && isSafari);

        const standalone =
            window.matchMedia?.('(display-mode: standalone)')?.matches ||
            (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
        setIsStandalone(Boolean(standalone));
    }, []);

    const shouldRender = useMemo(() => {
        if (!isMobile || isStandalone) return false;
        return canInstall || isIosSafari;
    }, [canInstall, isIosSafari, isMobile, isStandalone]);

    if (!shouldRender) return null;

    const handleInstall = async () => {
        await installApp();
    };

    return (
        <Card sx={{ border: '1px dashed', borderColor: 'divider' }}>
            <CardContent>
                <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Stack spacing={0.5}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Instale no seu celular
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {isIosSafari
                                ? 'No Safari, toque em Compartilhar e depois “Adicionar à Tela de Início”.'
                                : 'Acesse mais rápido e use em tela cheia.'}
                        </Typography>
                    </Stack>
                    {canInstall && !isIosSafari ? (
                        <Button
                            variant="contained"
                            onClick={handleInstall}
                            startIcon={<GetAppIcon />}
                            size="small"
                        >
                            Instalar aplicativo
                        </Button>
                    ) : null}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PWAInstallCard;
