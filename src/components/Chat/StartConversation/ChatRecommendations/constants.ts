import { PlusCircle, Compass, Code as CodeIcon, BookOpen } from 'lucide-react';

export const CHAT_STARTER_RECOMMENDATIONS = [
  {
    label: 'Create',
    icon: PlusCircle,
    recommendations: [
      'A social media content calendar for a new product launch',
      'A storyboard for an educational video series on climate change',
      'A weekly vegetarian meal plan optimized for muscle gain',
      'A marketing strategy outline for a SaaS startup targeting SMBs',
      'A group project plan for a community service initiative',
      'A team brainstorming session for a new feature in a mobile app',
      'A shared document for feedback on a company-wide policy proposal',
      'An online survey to gather input on improving internal communication',
    ],
  },
  {
    label: 'Explore',
    icon: Compass,
    recommendations: [
      'The ethical implications of AI in healthcare',
      'The history and modern relevance of the Silk Road trade routes',
      'Different methods of renewable energy generation and their pros/cons',
      'The potential future developments in quantum computing',
      'The impact of climate change on global biodiversity',
      'The origins and development of different world cuisines',
      'Innovative solutions for sustainable urban planning',
      'The rise of e-commerce and its effect on traditional retail stores',
    ],
  },
  {
    label: 'Code',
    icon: CodeIcon,
    recommendations: [
      'A React component for a drag-and-drop to-do list',
      'A Python script that scrapes the latest headlines from a news site',
      'An algorithm in JavaScript to solve the 0/1 knapsack problem',
      'A SQL query that analyzes user engagement over the past month',
      'A customer feedback form for a website redesign project',
      'An agile development process for a new software feature rollout',
      'An employee training program for a new CRM system implementation',
      'A marketing campaign timeline for a product launch event',
    ],
  },
  {
    label: 'Learn',
    icon: BookOpen,
    recommendations: [
      'The fundamentals of how neural networks work',
      'The key differences between HTTP/1.1 and HTTP/2',
      'Best practices for writing effective unit tests',
      'The core concepts of Kubernetes architecture',
      'The impact of globalization on local economies',
      'The history and evolution of human rights movements',
      'Current trends in sustainable fashion and ethical supply chains',
      'The psychology of decision-making and its applications in marketing',
    ],
  },
];
