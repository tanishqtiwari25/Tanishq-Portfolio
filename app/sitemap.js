import {projectsData} from '@/data/projectsData';
export default async function sitemap() {
  return [
    ...projectsData.map(project=>({url:`https://realtanishqtiwari.in/work/${project.id}`,changeFrequency:"monthly",priority:0.7})),
    {
      url: "https://realtanishqtiwari.in",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
