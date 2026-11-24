import { caseStudies } from './caseStudies.js';
import { projectsData } from './projectsData';

export const profile = {
  name: 'Tanishq Tiwari', role: 'React Frontend Developer', location: 'Kanpur, India',
  email: 'tanishqtiwari265@gmail.com', github: 'https://github.com/tanishqtiwari25',
  linkedin: 'https://www.linkedin.com/in/tanishq-tiwari-31138b252', resume: '/resume/tanishq-tiwari.pdf',
  introduction: 'I build thoughtful websites and applications with React, JavaScript and a clear understanding of the business behind them.',
  skills: [
    {title:'Frontend', capability:'Responsive, reusable interfaces.', items:['React.js','JavaScript (ES6+)','HTML5','CSS3','Tailwind CSS','Context API']},
    {title:'Integrations & backend', capability:'Connect the interface to real workflows.', items:['REST APIs','Payment gateways','WhatsApp integration','Node.js','Express.js','Selenium']},
    {title:'Quality & workflow', capability:'Build, test and maintain with care.', items:['Jest','Git / GitHub','Chrome DevTools','Debugging','PWA','Responsive & cross-browser design']},
  ],
  services: [
    {title:'Websites with a purpose.',description:'Responsive business websites and landing pages that make your services easy to understand.',deliverables:'Page structure, reusable components, mobile layouts and on-page SEO.'},
    {title:'Interfaces for real work.',description:'React applications for managing information, customers and day-to-day business workflows.',deliverables:'Application screens, interactive state, forms and API integration.'},
    {title:'Connected customer journeys.',description:'Bring payments, invoices and external services into the experience.',deliverables:'Payment gateway, WhatsApp or REST API integration, scoped to your product.'},
  ],
};
const overrides = {
  'truly-grow': {category:'Business website',description:'A business growth website that takes clients from discovering services to paying online.',role:'Frontend development and payment gateway integration.',features:['Responsive, reusable service-page components','Online payment gateway and checkout flow','Clear presentation of agency services'],image:'truly-grow-capture.webp',stack:['Responsive components','Payment integration']},
  'wealth-pilot': {category:'Financial software',description:'A focused money manager for recording income, reviewing expenses and making sense of everyday finances.',role:'Built the transaction interface and responsive financial views.',features:['Income and expense tracking','Recording and editing financial transactions','Clear views for reviewing financial activity'],image:'wealth-pilot-capture.webp',stack:['Transaction workflows','Responsive design']},
  'sole-track': {category:'Inventory PWA',description:'Stock management, invoice generation and WhatsApp delivery in one installable business application.',role:'Built the PWA, inventory workflow, invoice generation and WhatsApp integration.',features:['Installable on mobile and desktop','Stock and inventory management','Customer invoices through WhatsApp','Sales and inventory reports'],stack:['PWA','WhatsApp integration','Invoice generation']},
  'ecommerce-platform': {category:'React storefront',description:'A responsive storefront with product discovery, cart state and a consistent checkout experience.',role:'Built reusable React components, API integration, cart and wishlist state.',image:'ecommerce-capture.webp',stack:['React.js','Tailwind CSS','REST APIs','Context API']},
  'data-scraper-system': {category:'Automation',description:'A lead collection system that turns extracted data into filtered, structured information.',role:'Built the Node.js, Express and Selenium pipeline, including filtering and backend request handling.',stack:['Node.js','Express.js','Selenium']},
  '2d-browser-game': {category:'Browser game',description:'An interactive browser game with movement, collision handling and score tracking.',role:'Implemented game interaction, collision handling and score state.',image:'game-capture.webp'},
};
const order=['truly-grow','wealth-pilot','sole-track','orbit-crm','instock','data-scraper-system','ecommerce-platform','2d-browser-game'];
export const work = order.map(id => {
  const source=projectsData.find(project=>project.id===id), detail={...(overrides[id]||{}),...(caseStudies[id]||{})};
  return {...source,...detail,description:detail.description||source.shortDescription,features:detail.features||source.keyFeatures,stack:detail.stack||source.technologies,
    role:detail.role||'Contribution details to be confirmed.',engagement:detail.engagement||'Portfolio project',sections:detail.sections,challenges:detail.challenges||'',whatILearned:'',
    // Missing engagement, challenge or outcome evidence stays explicit in each case study.
    evidence: 'No independently verified performance or business metrics supplied.'};
});
