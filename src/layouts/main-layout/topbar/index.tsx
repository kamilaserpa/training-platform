import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import IconifyIcon from 'components/base/IconifyIcon';
import HorizonLogo from 'assets/images/logo-main.png';
import Image from 'components/base/Image';
import ProfileMenu from './ProfileMenu';
import LanguageSelect from './LanguageSelect';

interface TopbarProps {
  isClosing: boolean;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Topbar = ({ isClosing, mobileOpen, setMobileOpen }: TopbarProps) => {
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  return (
    <Stack
      minHeight={{ xs: 56, sm: 64, md: 72 }}
      height={{ xs: 56, sm: 64, md: 72 }}
      alignItems="center"
      justifyContent="space-between"
      position="sticky"
      top={0}
      zIndex={1200}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(6px)',
        backgroundColor: 'background.paper',
      }}
      px={2}
    >
      <Stack spacing={{ xs: 2, sm: 2 }} alignItems="center" sx={{ py: 1 }}>
        <ButtonBase
          component={Link}
          href="/"
          disableRipple
          sx={{ lineHeight: 0, display: { xs: 'none', sm: 'block', lg: 'none' } }}
        >
          <Image src={HorizonLogo} alt="logo" height={44} width={44} />
        </ButtonBase>

        <Toolbar sx={{ display: { xm: 'block', lg: 'none' }, minHeight: 48 }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
            sx={{ minWidth: 48, minHeight: 48 }}
          >
            <IconifyIcon icon="ic:baseline-menu" />
          </IconButton>
        </Toolbar>

        <Toolbar sx={{ display: { xm: 'block', md: 'none' }, minHeight: 48 }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="search" sx={{ minWidth: 48, minHeight: 48 }}>
            <IconifyIcon icon="bx:search" />
          </IconButton>
        </Toolbar>

        <TextField
          variant="filled"
          placeholder="Search"
          sx={{ width: 320, display: { xs: 'none', md: 'flex' } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconifyIcon icon="bx:search" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack spacing={{ xs: 2, sm: 2 }} alignItems="center" sx={{ py: 1 }}>
        {/* Internacionalização: seleção do idioma */}
        {/* <LanguageSelect /> */}
        <IconButton size="large" sx={{ minWidth: 48, minHeight: 48 }} aria-label="notificações">
          <Badge color="error" variant="dot">
            <IconifyIcon icon="ic:baseline-notifications-none" />
          </Badge>
        </IconButton>
        <ProfileMenu />
      </Stack>
    </Stack>
  );
};

export default Topbar;
