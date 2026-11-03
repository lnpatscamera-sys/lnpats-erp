import { createFileRoute } from '@tanstack/react-router';
import { InstructorTraining } from '@/components/InstructorTraining';
import { instructorOptions } from '@/lib/instructor';
import { phaseHead } from '@/lib/phase2';
export const Route = createFileRoute('/_authenticated/examinations')({ head: () => phaseHead('Examination & Assessment', 'LNPATS assigned-course examination & assessment.'), loader: ({ context }) => context.queryClient.ensureQueryData(instructorOptions), component: () => <InstructorTraining view="exams" /> });
