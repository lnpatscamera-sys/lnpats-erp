import { createFileRoute } from '@tanstack/react-router';
import { InstructorTraining } from '@/components/InstructorTraining';
import { instructorOptions } from '@/lib/instructor';
import { phaseHead } from '@/lib/phase2';
export const Route = createFileRoute('/_authenticated/class-attendance')({ head: () => phaseHead('Class Attendance', 'LNPATS assigned-course class attendance.'), loader: ({ context }) => context.queryClient.ensureQueryData(instructorOptions), component: () => <InstructorTraining view="attendance" /> });
