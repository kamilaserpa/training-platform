import Grid from '@mui/material/Grid';
import ShortcutWeek from './ShortcutWeek';
import ShortcutTraining from './ShortcutTraining';
import ShortcutParameters from './ShortcutParameters';

const Shortcuts = () => {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={6} md={4}>
        <ShortcutWeek />
      </Grid>

      <Grid item xs={6} sm={6} md={4}>
        <ShortcutTraining />
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <ShortcutParameters />
      </Grid>
    </Grid>
  );
};

export default Shortcuts;
