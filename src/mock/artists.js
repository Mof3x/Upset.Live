export const artists = {
  gor: {
    slug: "gor",
    name: "Gor",
    discipline: "Visual Artist",
    location: "London, UK",
    image: "/public/gor.jpeg",
    imageAlt: "Portrait of Gor",
    bio: [
      "Gor is a multidisciplinary artist working across painting, image-making and visual research.",
      "Their practice explores memory, atmosphere, history and speculative forms of cultural expression.",
    ],
    tags: ["Painting", "Visual Art", "African Gothic"],
    links: {
      instagram: "https://instagram.com/",
    },
    works: [
      {
        slug: "night-study",
        title: "Night Study",
        image: "/gor.jpeg",
        imageAlt: "Night Study artwork",
        artist: { name: "Gor", slug: "gor" },
        type: "Painting",
        year: "2026",
        excerpt: "A short description of the work.",
        tags: ["Painting", "Archive"],
      },
      {
        slug: "untitled-figure",
        title: "Untitled Figure",
        image: "/public/gor.jpeg",
        imageAlt: "Untitled Figure artwork",
        artist: { name: "Gor", slug: "gor" },
        type: "Visual Art",
        year: "2025",
        excerpt: "A short description of the work.",
        tags: ["Figure", "Memory"],
      },
    ],
  },
};
