export type Movie = {
  id: string;
  title: string;
  titleTR: string;
  year: number;
  rating: number;
  votes: string;
  duration: string;
  genres: string[];
  quality: "HD" | "4K" | "CAM" | "FullHD";
  isNew: boolean;
  isTop: boolean;
  description: string;
  director: string;
  cast: string[];
  country: string;
  language: string;
  poster: string;
  backdrop: string;
  trailer: string;
};

const TMDB_POSTER = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/original";

export const movies: Movie[] = [
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    titleTR: "Dune: İkinci Bölüm",
    year: 2024,
    rating: 8.5,
    votes: "642K",
    duration: "2s 46d",
    genres: ["Bilim Kurgu", "Macera", "Dram"],
    quality: "4K",
    isNew: true,
    isTop: true,
    description: "Paul Atreides, Chani ve Fremen'lerle güçlerini birleştirerek ailesi ile Fremanler'i yok etmeye yemin eden güçlere karşı savaşmak için tehlikeli bir yolculuğa çıkar.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"],
    country: "ABD",
    language: "Türkçe Dublaj / Altyazı",
    poster: `${TMDB_POSTER}/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg`,
    backdrop: `${TMDB_BACKDROP}/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`,
    trailer: "Way9FwdAB2M",
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    titleTR: "Oppenheimer",
    year: 2023,
    rating: 8.3,
    votes: "913K",
    duration: "3s 0d",
    genres: ["Biyografi", "Dram", "Tarih"],
    quality: "4K",
    isNew: false,
    isTop: true,
    description: "Atom bombasının geliştirilmesine yol açan Manhattan Projesi'nin öncülüğünü yapan teorik fizikçi J. Robert Oppenheimer'ın hikayesi.",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    country: "ABD / İngiltere",
    language: "Türkçe Dublaj / Altyazı",
    poster: `${TMDB_POSTER}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
    backdrop: `${TMDB_BACKDROP}/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg`,
    trailer: "uYPbbksJxIY",
  },
  {
    id: "poor-things",
    title: "Poor Things",
    titleTR: "Zavallılar",
    year: 2023,
    rating: 7.8,
    votes: "284K",
    duration: "2s 21d",
    genres: ["Komedi", "Dram", "Fantezi"],
    quality: "HD",
    isNew: false,
    isTop: true,
    description: "Müzmin bir maceracı avukat tarafından kurtarılan ve Viktorya döneminin erkek egemen dünyasını keşfeden genç bir kadının olağanüstü hikayesi.",
    director: "Yorgos Lanthimos",
    cast: ["Emma Stone", "Mark Ruffalo", "Willem Dafoe", "Ramy Youssef"],
    country: "İngiltere",
    language: "Türkçe Altyazı",
    poster: `${TMDB_POSTER}/kCGlIMHnOm8JPXtGTu6MXWMW8Dc.jpg`,
    backdrop: `${TMDB_BACKDROP}/bQXAqRx2Fgc46uCVWgoPz5L5Dtr.jpg`,
    trailer: "RlbR5N6veqw",
  },
  {
    id: "killers-flower-moon",
    title: "Killers of the Flower Moon",
    titleTR: "Ay Çiçeğinin Katilleri",
    year: 2023,
    rating: 7.6,
    votes: "223K",
    duration: "3s 26d",
    genres: ["Suç", "Dram", "Tarih"],
    quality: "HD",
    isNew: false,
    isTop: false,
    description: "Osage Nation'da petrol keşfedilmesinin ardından Osage yerlileri aniden zenginleşir ve bir dizi cinayet dalgasıyla karşı karşıya kalır.",
    director: "Martin Scorsese",
    cast: ["Leonardo DiCaprio", "Robert De Niro", "Lily Gladstone"],
    country: "ABD",
    language: "Türkçe Altyazı",
    poster: `${TMDB_POSTER}/dB6Krk806zeqd955CR9K48TzaO3.jpg`,
    backdrop: `${TMDB_BACKDROP}/1X7vow16X7CnCoD9atherf7jPBpX.jpg`,
    trailer: "EP34Yoxs3FQ",
  },
  {
    id: "godzilla-kong",
    title: "Godzilla x Kong: The New Empire",
    titleTR: "Godzilla x Kong: Yeni İmparatorluk",
    year: 2024,
    rating: 6.3,
    votes: "187K",
    duration: "1s 55d",
    genres: ["Aksiyon", "Macera", "Fantezi"],
    quality: "4K",
    isNew: true,
    isTop: false,
    description: "Dev devlerin bu son macerasında Kong ve Godzilla, insanlığın varlığını tehdit eden büyük bir tehlikeye karşı birleşmek zorunda kalır.",
    director: "Adam Wingard",
    cast: ["Rebecca Hall", "Brian Tyree Henry", "Dan Stevens"],
    country: "ABD",
    language: "Türkçe Dublaj / Altyazı",
    poster: `${TMDB_POSTER}/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg`,
    backdrop: `${TMDB_BACKDROP}/5gMzHMpXwWNkGDvHVjdxHFE9l0l.jpg`,
    trailer: "odM92ap8_c0",
  },
  {
    id: "civil-war",
    title: "Civil War",
    titleTR: "İç Savaş",
    year: 2024,
    rating: 7.2,
    votes: "156K",
    duration: "1s 49d",
    genres: ["Aksiyon", "Dram", "Gerilim"],
    quality: "HD",
    isNew: true,
    isTop: false,
    description: "Amerika Birleşik Devletleri'nde iç savaşın patlak verdiği yakın bir gelecekte, gazetecilerden oluşan bir grup tehlikeli bir yolculuğa çıkar.",
    director: "Alex Garland",
    cast: ["Kirsten Dunst", "Wagner Moura", "Cailee Spaeny"],
    country: "ABD / İngiltere",
    language: "Türkçe Altyazı",
    poster: `${TMDB_POSTER}/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg`,
    backdrop: `${TMDB_BACKDROP}/ugS5FVfCI3RV0ZwZtBV3HAV75OX.jpg`,
    trailer: "pB_GHd8Hkxo",
  },
  {
    id: "furiosa",
    title: "Furiosa: A Mad Max Saga",
    titleTR: "Furiosa: Bir Mad Max Destanı",
    year: 2024,
    rating: 7.8,
    votes: "198K",
    duration: "2s 28d",
    genres: ["Aksiyon", "Macera", "Bilim Kurgu"],
    quality: "4K",
    isNew: true,
    isTop: true,
    description: "Furiosa, kıyamet sonrası dünyadan kaçmayı başarır ve kaptığı bir savaş arabasıyla kendini bir güç odağının ortasında bulur.",
    director: "George Miller",
    cast: ["Anya Taylor-Joy", "Chris Hemsworth", "Tom Burke"],
    country: "Avustralya",
    language: "Türkçe Altyazı",
    poster: `${TMDB_POSTER}/iADOJ8Zymht2JPMoy3R7xceZprc.jpg`,
    backdrop: `${TMDB_BACKDROP}/oBIQDKcqNxKckjugtmzpIIOgDMz.jpg`,
    trailer: "XJMuhwVlca4",
  },
  {
    id: "inside-out-2",
    title: "Inside Out 2",
    titleTR: "Inside Out 2",
    year: 2024,
    rating: 7.8,
    votes: "412K",
    duration: "1s 40d",
    genres: ["Animasyon", "Aile", "Komedi"],
    quality: "HD",
    isNew: true,
    isTop: true,
    description: "Riley ergenlik çağına girerken, Neşe ve diğer duygular Endişe adlı yeni bir duygu ile başa çıkmak zorunda kalır.",
    director: "Kelsey Mann",
    cast: ["Amy Poehler", "Maya Hawke", "Kensington Tallman"],
    country: "ABD",
    language: "Türkçe Dublaj",
    poster: `${TMDB_POSTER}/oxxrA7RhKR2dtycrPLUxzRFuCSo.jpg`,
    backdrop: `${TMDB_BACKDROP}/3qMgAKOI6banNzstIVp2GDYk45B.jpg`,
    trailer: "LEjhY15eCx0",
  },
  {
    id: "kingdom-of-planet-of-apes",
    title: "Kingdom of the Planet of the Apes",
    titleTR: "Maymunlar Cehennemi: Yeni Krallık",
    year: 2024,
    rating: 6.8,
    votes: "142K",
    duration: "2s 25d",
    genres: ["Aksiyon", "Macera", "Bilim Kurgu"],
    quality: "HD",
    isNew: true,
    isTop: false,
    description: "Caesar'ın ölümünden nesiller sonra maymunlar egemen tür haline gelmiştir. Genç bir maymun, gerçek mirası sorgulayan tehlikeli bir yolculuğa çıkar.",
    director: "Wes Ball",
    cast: ["Owen Teague", "Freya Allan", "Kevin Durand"],
    country: "ABD",
    language: "Türkçe Dublaj / Altyazı",
    poster: `${TMDB_POSTER}/gKkl37BQuKTanygYQG1pyYgLVgf.jpg`,
    backdrop: `${TMDB_BACKDROP}/fqv8v6AycXKsivp1T5yKtLbGXce.jpg`,
    trailer: "XtLDMCnSMXA",
  },
  {
    id: "wonka",
    title: "Wonka",
    titleTR: "Wonka",
    year: 2023,
    rating: 7.0,
    votes: "221K",
    duration: "1s 56d",
    genres: ["Komedi", "Aile", "Fantezi"],
    quality: "HD",
    isNew: false,
    isTop: false,
    description: "Willy Wonka'nın ikonik çikolata fabrikasını kurmasından önceki yıllarda dünyayı şeker ve hayal gücüyle değiştirme planlarını anlatan hikaye.",
    director: "Paul King",
    cast: ["Timothée Chalamet", "Calah Lane", "Keegan-Michael Key"],
    country: "ABD / İngiltere",
    language: "Türkçe Dublaj",
    poster: `${TMDB_POSTER}/qhb1qOilapbapxWQn9jtRCMwXJF.jpg`,
    backdrop: `${TMDB_BACKDROP}/1XDDXPXGiI8id7MrUxK37Y0ug1d.jpg`,
    trailer: "otNh9bTjXWA",
  },
  {
    id: "aquaman-lost-kingdom",
    title: "Aquaman and the Lost Kingdom",
    titleTR: "Aquaman ve Kayıp Krallık",
    year: 2023,
    rating: 5.4,
    votes: "96K",
    duration: "2s 4d",
    genres: ["Aksiyon", "Macera", "Fantezi"],
    quality: "HD",
    isNew: false,
    isTop: false,
    description: "Kara Manta'nın kötü güçler kazanmasıyla Aquaman, Atlantis'i ve tüm dünyayı kurtarmak için eski düşmanı kardeşinden yardım ister.",
    director: "James Wan",
    cast: ["Jason Momoa", "Patrick Wilson", "Amber Heard"],
    country: "ABD",
    language: "Türkçe Dublaj",
    poster: `${TMDB_POSTER}/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg`,
    backdrop: `${TMDB_BACKDROP}/2RYBIJvVlJKLHGYqGWdqkW2nDXf.jpg`,
    trailer: "sxnRBMOUaLE",
  },
  {
    id: "migration",
    title: "Migration",
    titleTR: "Göç",
    year: 2023,
    rating: 7.0,
    votes: "78K",
    duration: "1s 23d",
    genres: ["Animasyon", "Komedi", "Aile"],
    quality: "HD",
    isNew: false,
    isTop: false,
    description: "Ailesi ile New England gölünde mutlu bir hayat yaşayan bir ördek ailesi, göç yolculuğuna çıkarak inanılmaz maceralar yaşar.",
    director: "Benjamin Renner",
    cast: ["Kumail Nanjiani", "Elizabeth Banks", "Keegan-Michael Key"],
    country: "ABD",
    language: "Türkçe Dublaj",
    poster: `${TMDB_POSTER}/ldfCF9RhR40mppkzmftxapaHeTo.jpg`,
    backdrop: `${TMDB_BACKDROP}/qRPZFpYq3KNfvUDtJ1OBuOBoKA8.jpg`,
    trailer: "WDgpOUQHoIs",
  },
];

export const genres = [
  "Tümü",
  "Aksiyon",
  "Macera",
  "Animasyon",
  "Biyografi",
  "Bilim Kurgu",
  "Dram",
  "Fantezi",
  "Gerilim",
  "Komedi",
  "Suç",
  "Tarih",
  "Aile",
];

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function getMoviesByGenre(genre: string): Movie[] {
  if (genre === "Tümü") return movies;
  return movies.filter((m) => m.genres.includes(genre));
}

export function searchMovies(query: string): Movie[] {
  const q = query.toLowerCase();
  return movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.titleTR.toLowerCase().includes(q) ||
      m.genres.some((g) => g.toLowerCase().includes(q)) ||
      m.director.toLowerCase().includes(q)
  );
}

export function getFeaturedMovie(): Movie {
  return movies[0];
}

export function getTopRated(): Movie[] {
  return [...movies].sort((a, b) => b.rating - a.rating).slice(0, 6);
}

export function getNewReleases(): Movie[] {
  return movies.filter((m) => m.isNew).slice(0, 6);
}
