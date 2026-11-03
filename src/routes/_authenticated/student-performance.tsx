import { createFileRoute } from '@tanstack/react-router';
import { InstructorTraining } from '@/components/InstructorTraining';
import { instructorOptions } from '@/lib/instructor';
import { phaseHead } from '@/lib/phase2';
export const Route = createFileRoute('/_authenticated/student-performance')({ head: () => phaseHead('Student Performance Records', 'LNPATS assigned-course student performance records.'), loader: ({ context }) => context.queryClient.ensureQueryData(instructorOptions), component: () => <InstructorTraining view="performance" /> });
