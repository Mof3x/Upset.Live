export const artists = {
  gor: {
    slug: "gor",
    name: "Gor",
    discipline: "Visual Artist",
    location: "Sheffield, UK",
    image: "/images/gor-portrait.jpg",
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
        image: "/images/night-study.jpg",
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
        image: "/images/untitled-figure.jpg",
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
