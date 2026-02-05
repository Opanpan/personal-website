export interface Project {
  id: string;
  image: string;
  techStack: string[];
  gradient: string;
}

export const projects: Project[] = [
  {
    id: 'banking_platform',
    image: '/images/projects/laju.png',
    techStack: ['React', 'Angular', 'TypeScript', 'Module Federation', 'Jest'],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
  },
  {
    id: 'hris_system',
    image: '/images/projects/laju.png',
    techStack: ['React', 'TypeScript', 'TailwindCSS', 'React Query', 'Vitest'],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
  },
  {
    id: 'lowcode_builder',
    image: '/images/projects/laju.png',
    techStack: ['Vue.js', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
  },
];
