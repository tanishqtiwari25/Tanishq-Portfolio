const originalProjects = [
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
    githubUrl: "https://github.com/tanishqtiwari25/E-COMMERCE-website",
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
    id: "2d-browser-game",
    title: "Interactive 2D Arcade Game",
    shortDescription: "Canvas-based interactive browser game built with Phaser.js featuring custom player physics, collision detection, and high-score logic.",
    category: "Frontend / Game Dev",
    featured: false,
    technologies: ["HTML5", "CSS3", "JavaScript (ES6+)", "Phaser.js"],
    githubUrl: "https://github.com/tanishqtiwari25/Bird-Game",
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
  }
];
const clean = p => ({...p, githubUrl: p.githubUrl?.includes('your-username') ? '' : p.githubUrl});
export const projectsData = [
{...clean(originalProjects[0]), title: 'Data Scraper', subtitle: 'Data Scraper & Lead Collection System', visual: 'scraper'},
{ id: 'montra-money-manager', title: 'Montra Money Manager', category: 'Financial software', shortDescription: 'Montra Money Manager is a financial software designed to help users track and manage their money, including income and expenses.', technologies: [], keyFeatures: ['Income tracking', 'Expense tracking', 'Money management'], visual: 'montra' },
{ id: 'truly-grow', title: 'Truly Grow', category: 'Business / Digital growth', shortDescription: 'A modern business growth website offering web development, digital marketing, SEO and paid advertising services.', technologies: [], keyFeatures: ['Web Development', 'Digital Marketing', 'SEO', 'Paid Ads'], visual: 'grow' },
{...clean(originalProjects[1]), title: 'E-Commerce Website', visual: 'commerce'},
{...clean(originalProjects[2]), title: 'Game', subtitle: 'Interactive 2D Browser Game', visual: 'game'}
];
