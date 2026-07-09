import type {
  Navigation,
  SiteConfig,
  Quiz,
  StockData,
  BreakingNews,
  NewstickerItem,
  Video,
} from "@/types";

export const defaultNavigation: Navigation = {
  primaryMenu: [
    {
      reference: { type: "SECTION", href: "/", label: "Start", isActive: true },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/politik",
        label: "Politik",
      },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/wirtschaft",
        label: "Wirtschaft",
      },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/berlin",
        label: "Berlin",
      },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/kultur",
        label: "Kultur",
      },
      commercial: false,
    },
    {
      reference: { type: "SECTION", href: "/kategorie/sport", label: "Sport" },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/kategorie/meinung",
        label: "Meinung",
      },
      commercial: false,
    },
  ],
  footerMenu: [
    {
      reference: { type: "SECTION", href: "/impressum", label: "Impressum" },
      commercial: false,
    },
    {
      reference: {
        type: "SECTION",
        href: "/datenschutz",
        label: "Datenschutz",
      },
      commercial: false,
    },
    {
      reference: { type: "SECTION", href: "/kontakt", label: "Kontakt" },
      commercial: false,
    },
  ],
  socialLinks: [],
};

export const defaultSiteConfig: SiteConfig = {
  title: "Berliner Rundschau",
  description: "",
  url: "",
  language: "de",
  tags: [],
  socialLinks: [],
  analytics: { gtmId: "" },
};

export const defaultQuiz: Quiz = {
  dailyQuiz: {
    date: "2026-06-28",
    title: "Wie gut kennen Sie Berlin?",
    questions: [
      {
        id: 1,
        question: "Wie viele Bezirke hat Berlin?",
        options: ["10", "12", "14", "16"],
        correctIndex: 1,
        explanation:
          "Berlin hat 12 Bezirke, die seit der Bezirksreform 2001 bestehen.",
      },
      {
        id: 2,
        question: "Wann fiel die Berliner Mauer?",
        options: [
          "3. Oktober 1989",
          "9. November 1989",
          "1. Januar 1990",
          "3. Oktober 1990",
        ],
        correctIndex: 1,
        explanation:
          "Die Berliner Mauer fiel am 9. November 1989 nach der legendären Pressekonferenz von Günter Schabowski.",
      },
      {
        id: 3,
        question: "Wie heißt Berlins größter See?",
        options: ["Wannsee", "Müggelsee", "Tegeler See", "Schlachtensee"],
        correctIndex: 1,
        explanation:
          "Der Müggelsee in Treptow-Köpenick ist mit 7,4 km² der größte See Berlins.",
      },
    ],
  },
  streakRewards: [
    { days: 3, badge: "Berlin-Kenner", emoji: "🏅" },
    { days: 7, badge: "Hauptstadt-Experte", emoji: "🎓" },
    { days: 14, badge: "Berlin-Meister", emoji: "🏆" },
  ],
};

export const defaultStockData: StockData = {
  indices: [
    {
      id: "dax",
      name: "DAX",
      value: 21450.32,
      change: 123.45,
      changePercent: 0.58,
      currency: "EUR",
      sparkline: [21200, 21280, 21350, 21400, 21450],
    },
    {
      id: "mdax",
      name: "MDAX",
      value: 28932.1,
      change: -45.2,
      changePercent: -0.16,
      currency: "EUR",
      sparkline: [29000, 28980, 28950, 28940, 28932],
    },
    {
      id: "dow",
      name: "Dow Jones",
      value: 42567.89,
      change: 234.56,
      changePercent: 0.55,
      currency: "USD",
      sparkline: [42300, 42400, 42450, 42500, 42568],
    },
    {
      id: "eurusd",
      name: "EUR/USD",
      value: 1.0892,
      change: 0.0023,
      changePercent: 0.21,
      currency: "",
      sparkline: [1.086, 1.087, 1.088, 1.089, 1.089],
    },
  ],
  watchlist: [
    {
      id: "sap",
      symbol: "SAP.DE",
      name: "SAP SE",
      price: 192.45,
      change: 3.2,
      changePercent: 1.69,
      marketCap: "237.1B",
      pe: 38.2,
      sector: "Technologie",
    },
    {
      id: "sie",
      symbol: "SIE.DE",
      name: "Siemens AG",
      price: 178.9,
      change: -1.45,
      changePercent: -0.8,
      marketCap: "142.8B",
      pe: 22.1,
      sector: "Industrie",
    },
    {
      id: "bayn",
      symbol: "BAYN.DE",
      name: "Bayer AG",
      price: 28.34,
      change: -0.56,
      changePercent: -1.94,
      marketCap: "27.8B",
      pe: null,
      sector: "Pharma",
    },
  ],
  chartData: {},
};

export const defaultBreakingNews: BreakingNews[] = [
  {
    id: "bn-1",
    headline: "Eilmeldung: Berliner Senat beschließt Klimaschutzpaket",
    href: "/artikel/klimaschutz-berlin-klimaneutral",
    severity: "breaking",
    publishedAt: "2026-06-28T14:00:00Z",
    expiresAt: "2026-06-28T20:00:00Z",
  },
  {
    id: "bn-2",
    headline: "BVG: Signalstörung auf der U2 — Verspätungen erwartet",
    href: "/artikel/bvg-ubahn-netz-ausbau",
    severity: "alert",
    publishedAt: "2026-06-28T12:00:00Z",
  },
];

export const defaultNewsticker: NewstickerItem[] = [
  {
    id: "nt-1",
    type: "TimelineTeaser",
    topic: "Politik",
    headline: {
      label: "Bundestag beschließt neues Digitalgesetz",
      href: "/artikel/bundestag-digitalgesetz",
    },
    publicationDate: "2026-06-28T12:30:00Z",
    isPremium: false,
  },
  {
    id: "nt-2",
    type: "TimelineTeaser",
    topic: "Berlin",
    headline: {
      label: "S-Bahn-Störung auf der Ringbahn behoben",
      href: "/artikel/sbahn-ringbahn-stoerung",
    },
    publicationDate: "2026-06-28T11:45:00Z",
    isPremium: false,
  },
  {
    id: "nt-3",
    type: "TimelineTeaser",
    topic: "Wirtschaft",
    headline: {
      label: "DAX schließt mit Rekordhoch bei 21.450 Punkten",
      href: "/artikel/dax-rekordhoch",
    },
    publicationDate: "2026-06-28T10:00:00Z",
    isPremium: true,
  },
  {
    id: "nt-4",
    type: "TimelineTeaser",
    topic: "Sport",
    headline: {
      label: "Union Berlin verpflichtet schwedischen Stürmer",
      href: "/artikel/union-berlin-transfer",
    },
    publicationDate: "2026-06-28T09:15:00Z",
    isPremium: false,
  },
  {
    id: "nt-5",
    type: "TimelineTeaser",
    topic: "Kultur",
    headline: {
      label: "Berlinale kündigt Jury-Präsidentin für 2027 an",
      href: "/artikel/berlinale-jury",
    },
    publicationDate: "2026-06-28T08:30:00Z",
    isPremium: false,
  },
  {
    id: "nt-6",
    type: "TimelineTeaser",
    topic: "Berlin",
    headline: {
      label: "Neue Fahrradstraße in Friedrichshain eröffnet",
      href: "/artikel/fahrradstrasse-friedrichshain",
    },
    publicationDate: "2026-06-27T18:00:00Z",
    isPremium: false,
  },
];

export const defaultVideos: Video[] = [];
