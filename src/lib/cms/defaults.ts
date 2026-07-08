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
  dailyQuiz: { date: "", title: "", questions: [] },
  streakRewards: [],
};

export const defaultStockData: StockData = {
  indices: [],
  watchlist: [],
  chartData: {},
};

export const defaultBreakingNews: BreakingNews[] = [];
export const defaultNewsticker: NewstickerItem[] = [];
export const defaultVideos: Video[] = [];
