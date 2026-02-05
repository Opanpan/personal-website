export interface Project {
  id: string;
  image: string;
  techStack: string[];
  gradient: string;
}

export const projects: Project[] = [
  {
    id: 'biztrip',
    image: '/images/projects/default-project-image.webp',
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'React Query', 'Jest'],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  {
    id: 'cash_management',
    image: '/images/projects/laju.webp',
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'Redux', 'Jest'],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'super_app',
    image: '/images/projects/super-app.webp',
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'MongoDB'],
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
  {
    id: 'ifg',
    image: '/images/projects/ifg.webp',
    techStack: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'AWS'],
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
  },
  {
    id: 'tembuni',
    image: '/images/projects/tembuni.webp',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL'],
    gradient: 'from-pink-500 via-rose-500 to-red-500',
  },
  {
    id: 'accurate',
    image: '/images/projects/accurate.webp',
    techStack: ['React', 'TypeScript', 'Firebase', 'Material-UI', 'Redux'],
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
  },
];
