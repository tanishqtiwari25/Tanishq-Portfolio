const originalProjects = [
  {
    id: "data-scraper-system",
    title: "Data Scraper & Lead Collection System",
    shortDescription: "Automated end-to-end web scraping system engineered for structured lead generation, robust DOM parsing, and clean data output.",
    category: "Full Stack / Automation",
    featured: true,
    technologies: ["JavaScript", "Node.js", "Express.js", "Selenium", "ChromeDriver"],
    githubUrl: "https://github.com/your-username/data-scraper", // Replace with real links
    liveUrl: "https://diamond.realtanishqtiwari.in",
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
{
  id: 'sole-track', title: 'Sole Track', mark: 'ST', featured: true,
  subtitle: 'Inventory, invoices and WhatsApp — together.',
  category: 'Business operations / PWA', visual: 'sole-track',
  shortDescription: 'An inventory management PWA that connects stock management, customer billing and daily reports, with invoices delivered directly to customers through WhatsApp.',
  technologies: ['PWA', 'WhatsApp'], liveUrl: '', githubUrl: '',
  keyFeatures: [
    'Inventory and stock management in a progressive web app.',
    'Customer billing with invoices sent directly through WhatsApp.',
    'Daily reports for reviewing business activity.'
  ],
  problem: 'Stock records, customer invoices and daily reporting can become disconnected when managed across separate tools.',
  solution: 'Bring inventory, invoicing, WhatsApp delivery and daily reports into one PWA workflow.'
},
{
  id: 'orbit-crm', title: 'Orbit CRM', mark: 'OR', featured: true,
  subtitle: 'A live view of your team and their work.',
  category: 'CRM / Team operations', visual: 'orbit-crm',
  shortDescription: 'A professional CRM with live employee activity monitoring, visibility into who is working on each task, and progress and completion-time tracking.',
  technologies: [], liveUrl: 'https://orbit.realtanishqtiwari.in', githubUrl: '',
  keyFeatures: [
    'Live monitoring of employee work activity.',
    'Visibility into who is working on which task.',
    'Task progress, timelines and expected completion tracking.'
  ],
  problem: 'Managers need a clear view of active work, task ownership and completion timelines without relying on scattered status updates.',
  solution: 'Combine live team activity and task progress in a professional CRM workspace.'
},
{
  id: 'instock', title: 'InStock', mark: 'IN', featured: true,
  subtitle: 'Market context, connected by an LLM.',
  category: 'AI / Investment research', visual: 'instock',
  shortDescription: 'An LLM-based investment research assistant that combines live market data, news and company reports to generate stock outlooks and potential entry-timing insights.',
  technologies: ['LLM'], liveUrl: '', githubUrl: '',
  keyFeatures: [
    'Live market tracking and market-news analysis.',
    'Company-report analysis for stock research.',
    'LLM-based bullish and bearish stock outlooks.',
    'Potential purchase-timing insights from the research.',
    'Continuously refreshed analysis as new market information arrives.'
  ],
  problem: 'Market moves, financial news and company reports are spread across multiple sources, making it difficult to connect them into a coherent stock outlook.',
  solution: 'Use an LLM-based research workflow to connect these sources and surface stock outlooks and potential entry timing.'
},
{ id: 'wealth-pilot', liveUrl: 'https://montra.realtanishqtiwari.in', title: 'Wealth Pilot', category: 'Financial software', shortDescription: 'Wealth Pilot is a financial software designed to help users track and manage their money, including income and expenses.', technologies: [], keyFeatures: ['Income tracking', 'Expense tracking', 'Money management'], visual: 'wealth-pilot' },
{ id: 'truly-grow', liveUrl: 'https://trulygrow.realtanishqtiwari.in', title: 'Truly Grow', category: 'Business / Digital growth', shortDescription: 'A modern business growth website offering web development, digital marketing, SEO and paid advertising services.', technologies: [], keyFeatures: ['Web Development', 'Digital Marketing', 'SEO', 'Paid Ads'], visual: 'grow' },
{...clean(originalProjects[0]), title: 'Data Scraper', subtitle: 'Data Scraper & Lead Collection System', visual: 'scraper'},
{...clean(originalProjects[1]), title: 'E-Commerce Website', visual: 'commerce'},
{...clean(originalProjects[2]), title: 'Game', subtitle: 'Interactive 2D Browser Game', visual: 'game'}
];
