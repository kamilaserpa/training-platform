import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

type HeaderSkeletonProps = {
  withActions?: boolean;
};

export function HeaderSkeleton({ withActions = true }: HeaderSkeletonProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
      <Skeleton variant="text" width={220} height={42} />
      {withActions && <Skeleton variant="rounded" width={140} height={36} />}
    </Stack>
  );
}

type ListSkeletonProps = {
  rows?: number;
  withHeader?: boolean;
};

export function ListSkeleton({ rows = 8, withHeader = true }: ListSkeletonProps) {
  return (
    <Box>
      {withHeader && (
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Skeleton variant="text" width={260} height={28} />
        </Typography>
      )}
      <Stack spacing={1.25}>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={48} />
        ))}
      </Stack>
    </Box>
  );
}

export default function PageSectionSkeleton() {
  return (
    <Box>
      <HeaderSkeleton />
      <ListSkeleton rows={6} />
    </Box>
  );
}
