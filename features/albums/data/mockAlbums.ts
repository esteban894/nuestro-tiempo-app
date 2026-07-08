export interface Album {
  id: string;
  title: string;
  coverImage: string;
  isPrivate: boolean;
  images: string[];
}

export const mockAlbums: Album[] = [
  {
    id: "1",
    title: "Nuestro primer viaje",
    coverImage: "https://picsum.photos/seed/album1-1/600/600",
    isPrivate: false,
    images: [
      "https://picsum.photos/seed/album1-1/600/600",
      "https://picsum.photos/seed/album1-2/600/600",
      "https://picsum.photos/seed/album1-3/600/600",
      "https://picsum.photos/seed/album1-4/600/600",
    ],
  },
  {
    id: "2",
    title: "Cumpleaños de Nahir",
    coverImage: "https://picsum.photos/seed/album2-1/600/600",
    isPrivate: false,
    images: [
      "https://picsum.photos/seed/album2-1/600/600",
      "https://picsum.photos/seed/album2-2/600/600",
      "https://picsum.photos/seed/album2-3/600/600",
    ],
  },
  {
    id: "3",
    title: "Aniversario 2024",
    coverImage: "https://picsum.photos/seed/album3-1/600/600",
    isPrivate: false,
    images: [
      "https://picsum.photos/seed/album3-1/600/600",
      "https://picsum.photos/seed/album3-2/600/600",
      "https://picsum.photos/seed/album3-3/600/600",
      "https://picsum.photos/seed/album3-4/600/600",
      "https://picsum.photos/seed/album3-5/600/600",
    ],
  },
  {
    id: "4",
    title: "Fin de semana en la playa",
    coverImage: "https://picsum.photos/seed/album4-1/600/600",
    isPrivate: false,
    images: [
      "https://picsum.photos/seed/album4-1/600/600",
      "https://picsum.photos/seed/album4-2/600/600",
      "https://picsum.photos/seed/album4-3/600/600",
    ],
  },
  {
    id: "5",
    title: "Navidad en familia",
    coverImage: "https://picsum.photos/seed/album5-1/600/600",
    isPrivate: false,
    images: [
      "https://picsum.photos/seed/album5-1/600/600",
      "https://picsum.photos/seed/album5-2/600/600",
      "https://picsum.photos/seed/album5-3/600/600",
      "https://picsum.photos/seed/album5-4/600/600",
    ],
  },
  {
    id: "6",
    title: "Fotos con mascotas",
    coverImage: "https://picsum.photos/seed/album6-1/600/600",
    isPrivate: true,
    images: [
      "https://picsum.photos/seed/album6-1/600/600",
      "https://picsum.photos/seed/album6-2/600/600",
      "https://picsum.photos/seed/album6-3/600/600",
    ],
  },
];
