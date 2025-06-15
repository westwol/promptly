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
    ],
  },
];
