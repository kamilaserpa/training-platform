import Grid from '@mui/material/Grid';
import ShortcutWeek from './ShortcutWeek';
import ShortcutTraining from './ShortcutTraining';

const Shortcuts = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={6} md={4} xl={2}>
        <ShortcutWeek />
      </Grid>

      <Grid item xs={6} sm={6} md={4} xl={2}>
        <ShortcutTraining />
      </Grid>
    </Grid>
  );
};

export default Shortcuts;
