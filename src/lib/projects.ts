export interface Project {
  id: string;
  image: string;
  techStack: string[];
  gradient: string;
  appUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'biztrip',
    image: '/images/projects/default-project-image.webp',
    techStack: ['Vue', 'Jquery', 'TailwindCSS', 'Docker', 'Jenkins'],
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    appUrl: '',
  },
  {
    id: 'cash_management',
    image: '/images/projects/laju.webp',
    techStack: ['React', 'Antd', 'Redux', 'Jest'],
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    appUrl: 'https://laju.bankmandiri.co.id/laju/ui/',
  },
  {
    id: 'super_app',
    image: '/images/projects/super-app.webp',
    techStack: ['React', 'Angular', 'TypeScript', 'TailwindCSS', 'Jenkins', 'Docker', 'Unit Test'],
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    appUrl: 'https://koprabymandiri.com/',
  },
  {
    id: 'ifg',
    image: '/images/projects/ifg.webp',
    techStack: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'AWS'],
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    appUrl: 'https://space.life.id/login',
  },
  {
    id: 'tembuni',
    image: '/images/projects/tembuni.webp',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL'],
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    appUrl: 'https://www.tembuni.com/',
  },
  {
    id: 'accurate',
    image: '/images/projects/accurate.webp',
    techStack: ['React', 'TypeScript', 'Firebase', 'Material-UI', 'Redux'],
    gradient: 'from-indigo-500 via-blue-500 to-cyan-500',
    appUrl: 'https://accuratemedica.com/',
  },
];
