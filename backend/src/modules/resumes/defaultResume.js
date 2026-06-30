export const defaultResume = {
  owner: {
    name: 'Karan Kumar Sharma',
    username: 'karan-kumar-sharma',
    email: 'sk5485633@gmail.com',
    title: 'MERN Stack Engineer | Node.js Backend Engineer | 4.8+ Years Experience',
    location: 'India',
    links: [
      { label: 'Portfolio', url: '/resume/karan-kumar-sharma' },
      { label: 'Email', url: 'mailto:sk5485633@gmail.com' }
    ]
  },
  resume: {
    id: 0,
    title: 'Karan Kumar Sharma - MERN Stack Engineer',
    slug: 'karan-kumar-sharma',
    template_slug: 'modern-developer',
    is_public: true,
    watermark_enabled: true
  },
  sections: [
    {
      id: 'default-summary',
      type: 'summary',
      title: 'Professional Summary',
      sort_order: 1,
      content: {
        text: 'MERN Stack Engineer and Node.js Backend Engineer with 4.8+ years of experience building scalable APIs, clean architecture systems, dashboards, OCR workflows, cloud deployments, and production-grade web platforms.'
      }
    },
    {
      id: 'default-skills',
      type: 'skills',
      title: 'Core Skills',
      sort_order: 2,
      content: {
        items: [
          'Node.js',
          'Express.js',
          'React.js',
          'MySQL',
          'MongoDB',
          'Docker',
          'AWS EC2',
          'AWS S3',
          'IAM',
          'JWT',
          'RBAC',
          'Clean Architecture',
          'Repository Pattern',
          'Redis',
          'System Design',
          'OpenAI API',
          'OCR'
        ]
      }
    },
    {
      id: 'default-projects',
      type: 'projects',
      title: 'Featured Projects',
      sort_order: 3,
      content: {
        items: [
          {
            name: 'Kenlo Real Estate Platform',
            description: 'Real estate platform with listings, user flows, secure APIs, and scalable data handling.'
          },
          {
            name: 'AI-Assisted Newspaper Article Extraction System',
            description: 'OCR-assisted system for extracting and structuring newspaper article content using AI workflows.'
          },
          {
            name: 'CRM Management System',
            description: 'Operational CRM with user management, activity flows, dashboards, and role-aware backend APIs.'
          }
        ]
      }
    }
  ]
};

