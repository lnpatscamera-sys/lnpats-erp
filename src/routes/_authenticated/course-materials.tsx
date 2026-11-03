import { createFileRoute } from '@tanstack/react-router';
import { InstructorTraining } from '@/components/InstructorTraining';
import { instructorOptions } from '@/lib/instructor';
import { phaseHead } from '@/lib/phase2';
export const Route = createFileRoute('/_authenticated/course-materials')({ head: () => phaseHead('Course Materials', 'LNPATS assigned-course course materials.'), loader: ({ context }) => context.queryClient.ensureQueryData(instructorOptions), component: () => <InstructorTraining view="materials" /> });
