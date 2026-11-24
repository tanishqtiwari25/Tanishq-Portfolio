import { work } from '@/data/professional';
export default async function sitemap() {
  return [
    {
      url: "https://realtanishqtiwari.in",
      changeFrequency: "monthly",
      priority: 1,
    },
    ...work.map(project=>({url:`https://realtanishqtiwari.in/work/${project.id}`,changeFrequency:'monthly',priority:.8})),
  ];
}
