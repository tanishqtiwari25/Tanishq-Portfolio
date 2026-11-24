export const SITE_URL = 'https://realtanishqtiwari.in';
export const SITE_TITLE = 'Tanishq Tiwari | React & Next.js Developer';
export const SITE_DESCRIPTION = 'React and Next.js developer in Kanpur, India. Tanishq Tiwari builds responsive web apps with JavaScript, reusable components and API integrations.';
export function profileSchema(projects) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: 'Tanishq Tiwari', url: SITE_URL,
        jobTitle: 'React and Next.js Developer', address: { '@type': 'PostalAddress', addressLocality: 'Kanpur', addressCountry: 'IN' },
        knowsAbout: ['JavaScript', 'React.js', 'Next.js', 'Responsive Web Design'],
        sameAs: ['https://github.com/tanishqtiwari25', 'https://www.linkedin.com/in/tanishq-tiwari-31138b252'] },
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: 'Tanishq Tiwari Portfolio', inLanguage: 'en', publisher: { '@id': `${SITE_URL}/#person` } },
      { '@type': 'ProfilePage', '@id': `${SITE_URL}/#page`, url: SITE_URL, name: 'Tanishq Tiwari — Projects, Skills & Experience',
        isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@id': `${SITE_URL}/#person` } },
      { '@type': 'ItemList', name: 'Tanishq Tiwari projects', itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem', position: index+1, item: { '@type': 'CreativeWork', name: project.title,
          description: project.description||project.shortDescription, url: `${SITE_URL}/work/${project.id}`, author: { '@id': `${SITE_URL}/#person` } },
      })) },
    ],
  };
}
export function serializeSchema(value) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
