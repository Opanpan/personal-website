export interface TechItem {
  name: string;
  icon: string;
  category: 'language' | 'framework' | 'tool';
}

export const techStack: TechItem[] = [
  // Languages
  {
    name: 'JavaScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    category: 'language',
  },
  {
    name: 'TypeScript',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    category: 'language',
  },
  {
    name: 'Go',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg',
    category: 'language',
  },
  {
    name: 'C',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
    category: 'language',
  },
  // Frameworks & Libraries
  {
    name: 'React',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    category: 'framework',
  },
  {
    name: 'Next.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',
    category: 'framework',
  },
  {
    name: 'Vue.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    category: 'framework',
  },
  {
    name: 'Angular',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    category: 'framework',
  },
  {
    name: 'jQuery',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jquery/jquery-original.svg',
    category: 'framework',
  },
  {
    name: 'Express.js',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    category: 'framework',
  },
  {
    name: 'TailwindCSS',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg',
    category: 'framework',
  },
  {
    name: 'HTML5',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    category: 'framework',
  },
  {
    name: 'CSS3',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    category: 'framework',
  },
  // Tools
  {
    name: 'Docker',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    category: 'tool',
  },
  {
    name: 'Git',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    category: 'tool',
  },
  {
    name: 'Jenkins',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jenkins/jenkins-original.svg',
    category: 'tool',
  },
  {
    name: 'MySQL',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    category: 'tool',
  },
  {
    name: 'PostgreSQL',
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    category: 'tool',
  },
];

export const getLanguages = () => techStack.filter(t => t.category === 'language');
export const getFrameworks = () => techStack.filter(t => t.category === 'framework');
export const getTools = () => techStack.filter(t => t.category === 'tool');
