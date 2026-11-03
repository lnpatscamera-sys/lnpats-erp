import { createFileRoute } from '@tanstack/react-router';
import { InstructorTraining } from '@/components/InstructorTraining';
import { instructorOptions } from '@/lib/instructor';
import { phaseHead } from '@/lib/phase2';
export const Route = createFileRoute('/_authenticated/training-schedule')({ head: () => phaseHead('Training Schedule', 'LNPATS assigned-course training schedule.'), loader: ({ context }) => context.queryClient.ensureQueryData(instructorOptions), component: () => <InstructorTraining view="schedule" /> });
