import { magizhtech, shopify, snssquarehub } from "../assets/images";
import {
    car,
    contact,
    css,
    estate,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    motion,
    mui,
    nextjs,
    nodejs,
    pricewise,
    react,
    redux,
    sass,
    snapgram,
    summiz,
    tailwindcss,
    threads,
    typescript,
    python
} from "../assets/icons";

export const skills = [
    {
        imageUrl: python,
        name: "Python",
        type: "Backend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    },
    {
        imageUrl: nextjs,
        name: "Next.js",
        type: "Frontend",
    },
    {
        imageUrl: express,
        name: "FastAPI / Flask",
        type: "Backend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: mongodb,
        name: "MongoDB",
        type: "Database",
    },
    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    {
        imageUrl: tailwindcss,
        name: "Tailwind CSS",
        type: "Frontend",
    },
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
    },
    {
        imageUrl: typescript,
        name: "SQL",
        type: "Database",
    },
    {
        imageUrl: redux,
        name: "Docker",
        type: "DevOps",
    },
];

export const experiences = [
    {
        title: "AI/ML Engineering Intern",
        company_name: "Magizh Technologies | Sathyamangalam",
        icon: magizhtech,
        iconBg: "#accbe1",
        date: "03/07/2025 – 22/07/2025",
        points: [
            "Developed and integrated AI/ML models into Python web applications using Flask and FastAPI.",
            "Implemented computer vision and NLP solutions for real-world business applications.",
            "Deployed scalable AI solutions with focus on model optimization and performance.",
        ],
    },
    {
        title: "Software Intern",
        company_name: "SNS Square Hub | Coimbatore",
        icon: snssquarehub,
        iconBg: "#1a3a5c",
        date: "02/2026 – 04/2026",
        points: [
            "Developed scalable web applications using Next.js and FastAPI, focusing on clean architecture, API design, and performance optimization.",
            "Worked with AI, Computer Vision, OCR, and multimodal models, integrating intelligent document processing and automation solutions into real-world applications.",
            "Gained hands-on experience with LLM concepts, tokenization, prompt engineering, and AI model integration, while contributing to production-ready software systems.",
        ],
    },
];

export const socialLinks = [
    {
        name: 'Contact',
        iconUrl: contact,
        link: '/contact',
    },
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://www.linkedin.com/in/adithyen-k',
    }
];

export const projects = [
    {
        iconUrl: pricewise,
        theme: 'btn-back-red',
        name: 'Real-Time Voice Chat Web App',
        description: 'AI-powered voice chat using Ollama, FasterWhisper & Kokoro with WebSocket — achieved <200ms latency with 95% accuracy.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: threads,
        theme: 'btn-back-green',
        name: 'Hand Gesture Control System',
        description: 'Computer vision system using OpenCV and ML for touchless human-computer interaction via gesture recognition. Recognized 10+ gestures with 92% accuracy.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: car,
        theme: 'btn-back-blue',
        name: 'Image Classification System',
        description: 'Web app with TensorFlow model training and Flask deployment for real-time image recognition.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: snapgram,
        theme: 'btn-back-pink',
        name: 'Quiz Application',
        description: 'Full-stack quiz app with FastAPI backend, user authentication and adaptive scoring system. Supports concurrent users.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: summiz,
        theme: 'btn-back-yellow',
        name: 'LinkedIn Post Automation',
        description: 'Automated content scheduling workflow using n8n and Make.com for social media management.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: estate,
        theme: 'btn-back-black',
        name: 'JARVIS-MARK_1',
        description: 'Personal AI assistant prototype showcasing automation and AI integrations — voice commands, task execution, and smart responses.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: redux,
        theme: 'btn-back-red',
        name: 'MCP Server',
        description: 'Implemented a stdio-based MCP server in Python, exposing custom tools for LLMs through Claude Desktop.',
        link: 'https://github.com/Adithyenkandasamy',
    },
    {
        iconUrl: motion,
        theme: 'btn-back-green',
        name: 'Subscription Manager – React Native',
        description: 'React Native application for tracking and managing recurring subscriptions with automated reminders and expense monitoring.',
        link: 'https://github.com/Adithyenkandasamy',
    },
];