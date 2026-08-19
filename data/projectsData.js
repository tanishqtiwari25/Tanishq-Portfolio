export const projectsData = [
  {
    id: "data-scraper-system",
    title: "Data Scraper & Lead Collection System",
    shortDescription: "Automated end-to-end web scraping system engineered for structured lead generation, robust DOM parsing, and clean data output.",
    category: "Full Stack / Automation",
    featured: true,
    technologies: ["JavaScript", "Node.js", "Express.js", "Selenium", "ChromeDriver"],
    githubUrl: "https://github.com/your-username/data-scraper", // Replace with real links
    liveUrl: "", // Optional or leave empty if CLI/Local
    keyFeatures: [
      "Automated headful/headless DOM navigation using Selenium WebDriver.",
      "Custom anti-blocking logic with randomized delay headers.",
      "Structured data extraction formatting outputs into JSON/CSV.",
      "Express REST API endpoints to trigger automated scraping jobs."
    ],
    // Case Study Modal Details (Strictly Interview-Defensible)
    problem: "Manual lead collection from complex web directories was slow, inefficient, and prone to human data-entry errors.",
    solution: "Designed a programmatic extraction engine using Node.js and Selenium that automated DOM navigation, collected business contact info, and validated data types before saving.",
    myRole: "Lead Engineer — Designed the scraping pipeline, dynamic locator logic, and REST controllers.",
    challenges: "Handling dynamic asynchronous DOM rendering and avoiding request blocking.",
    whatILearned: "Deepened knowledge of async JavaScript, event loop queue execution, headless browser controls, and CSS selector optimization."
  },
  {
    id: "ecommerce-platform",
    title: "Modern React E-Commerce Platform",
    shortDescription: "High-performance shopping experience with instant search indexing, client-side filtering, reactive cart state, and sleek responsive checkout UI.",
    category: "React / Frontend",
    featured: true,
    technologies: ["React.js", "JavaScript (ES6+)", "Tailwind CSS", "REST API", "Context API"],
    githubUrl: "https://github.com/your-username/react-ecommerce",
    liveUrl: "https://pickk.realtanishqtiwari.in",
    keyFeatures: [
      "Dynamic catalog fetching via external REST API.",
      "Real-time client-side search and category multi-filtering.",
      "Global state management for cart/wishlist with persistent localStorage sync.",
      "Fully responsive checkout flow with inline input validation."
    ],
    problem: "Traditional web store templates often suffer from sluggish page transitions and poor mobile UX.",
    solution: "Built a Single Page Application (SPA) using React component architecture, optimized state re-renders using useMemo, and created responsive layouts with Tailwind CSS.",
    myRole: "Frontend Developer — Built the entire component tree, state management logic, and responsive UI.",
    challenges: "Syncing cart state across dynamic UI re-renders without causing infinite update loops.",
    whatILearned: "Mastered React state hooks (`useState`, `useContext`, `useReducer`), component re-render optimizations, and API error state management."
  },
  {
    id: "business-crm-system",
    title: "Business CRM & Lead Pipeline System",
    shortDescription: "Comprehensive client relationship management interface to track sales pipelines, lead conversions, follow-up timelines, and revenue analytics.",
    category: "Full Stack Web App",
    featured: true,
    technologies: ["React.js", "JavaScript", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"],
    githubUrl: "https://github.com/your-username/business-crm",
    liveUrl: "",
    keyFeatures: [
      "Kanban-style sales pipeline visualizer for lead tracking.",
      "Interactive data tables with dynamic sorting and pagination.",
      "CRUD operations for client accounts, meeting notes, and task lists.",
      "Secure REST API backend connecting React frontend to MongoDB database."
    ],
    problem: "Small sales teams lack intuitive visual dashboards to track leads without paying heavy subscription fees.",
    solution: "Developed an intuitive dashboard featuring interactive UI elements, clean task-status indicators, and instant REST API data syncing.",
    myRole: "Full Stack Developer — Created the dashboard React wireframes, responsive state logic, and API routes.",
    challenges: "Designing intuitive multi-step form structures for adding customer details seamlessly.",
    whatILearned: "Understood full MERN stack data flow, CORS policies, REST endpoint organization, and dynamic component styling."
  },
  {
    id: "2d-browser-game",
    title: "Interactive 2D Arcade Game",
    shortDescription: "Canvas-based interactive browser game built with Phaser.js featuring custom player physics, collision detection, and high-score logic.",
    category: "Frontend / Game Dev",
    featured: false,
    technologies: ["HTML5", "CSS3", "JavaScript (ES6+)", "Phaser.js"],
    githubUrl: "https://github.com/your-username/2d-browser-game",
    liveUrl: "https://bird.realtanishqtiwari.in",
    keyFeatures: [
      "Sprite movement physics, jump velocity, and ground collision logic.",
      "Dynamic coin collection mechanisms and score updates.",
      "Smooth game loop animation at 60 FPS utilizing requestAnimationFrame.",
      "Responsive canvas scaling for both desktop and mobile viewports."
    ],
    problem: "Creating an engaging browser game experience without resorting to bloated external video engine wrappers.",
    solution: "Utilized Phaser.js and modern JS ES6 modules to craft lightweight, high-performance canvas rendering engine code.",
    myRole: "Frontend Game Developer — Programmed game state machines, collision callbacks, and UI score overlays.",
    challenges: "Ensuring consistent movement speeds across devices with varying monitor refresh rates.",
    whatILearned: "Gained hands-on proficiency with object-oriented programming in JS, delta-time math, dynamic audio trigger loops, and HTML5 Canvas API."
  },
  {
    id: "ai-chatbot-interface",
    title: "Conversational AI Chatbot Interface",
    shortDescription: "Sleek glassmorphism AI assistant UI with stream-response parsing, code syntax highlighting, and dynamic context retention.",
    category: "Generative AI / Frontend",
    featured: false,
    technologies: ["HTML5", "CSS3", "JavaScript", "REST API", "Generative AI"],
    githubUrl: "https://github.com/your-username/ai-chatbot-ui",
    liveUrl: "https://realtanishqtiwari.in/ai-chatbot",
    keyFeatures: [
      "Conversational chat UI with auto-scrolling message feeds.",
      "Streaming API response rendering with realistic typing indicators.",
      "Prompts preview panels and Quick-Prompt suggestion chips.",
      "Dark-themed glassmorphism aesthetic optimized for high contrast."
    ],
    problem: "Standard text interfaces for AI tools often lack proper UI cues for streaming responses and code formatting.",
    solution: "Designed a specialized conversational UI component that handles loading states, error boundaries, and formatted responses gracefully.",
    myRole: "Frontend Engineer — Designed the UI components, REST API integration, and user interaction states.",
    challenges: "Handling rapid user input submission during active API request streams.",
    whatILearned: "Practical implementation of API fetch streams, prompt engineering UI flows, and asynchronous error boundaries."
  },
  {
    id: "agency-business-websites",
    title: "High-Converting Business & Agency Portals",
    shortDescription: "Modern, SEO-optimized corporate web designs built for conversion, fast Core Web Vitals, and responsive service presentations.",
    category: "Next.js / Agency",
    featured: false,
    technologies: ["Next.js", "React.js", "JavaScript", "Tailwind CSS"],
    githubUrl: "https://github.com/your-username/agency-websites",
    liveUrl: "https://realtanishqtiwari.in",
    keyFeatures: [
      "Server-Side Rendering (SSR) for fast initial load performance.",
      "Custom UI sections for services, pricing plans, and client testimonials.",
      "Clean metadata architecture yielding perfect Lighthouse accessibility scores.",
      "Mobile-first responsive drawer navigation and seamless micro-interactions."
    ],
    problem: "Local businesses and boutique service providers struggle with slow, template-heavy site structures that hurt search rankings.",
    solution: "Architected modern Next.js static and dynamic web portals utilizing Tailwind CSS for ultra-lightweight asset bundles.",
    myRole: "Frontend Architect — Built reusable component design systems and layout wrappers.",
    challenges: "Achieving top-tier Core Web Vitals while maintaining high visual appeal.",
    whatILearned: "Deepened Next.js App Router knowledge, dynamic image optimization, and semantic SEO tag construction."
  }
];