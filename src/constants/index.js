import {
  people01,
  people02,
  people03,
  facebook,
  instagram,
  linkedin,
  twitter,
  airbnb,
  binance,
  coinbase,
  dropbox,
  apple,
  google,
} from "../assets";

export const signupUrl = "https://www.hoobank.com/create/";

export const navLinks = [
  { id: "features", title: "Features" },
  { id: "invoicing", title: "Invoicing" },
  { id: "cards", title: "Cards" },
  { id: "customers", title: "Customers" },
];

export const sampleInvoices = [
  {
    customer: "Maple & Rye Bakery",
    lines: [
      { description: "Shop counter, oak, fitted", amount: 1560 },
      { description: "Delivery and install", amount: 280 },
    ],
  },
  {
    customer: "Tidewater Dental",
    lines: [
      { description: "Reception desk repair", amount: 420 },
      { description: "Call-out", amount: 65 },
    ],
  },
  {
    customer: "Finch Street Books",
    lines: [
      { description: "Shelving, six bays", amount: 2940 },
      { description: "Delivery", amount: 120 },
    ],
  },
];

export const features = [
  {
    id: "feature-1",
    title: "Rewards",
    content:
      "Earn 1% back on everything your company cards spend. We pay it into your account at the end of each month.",
  },
  {
    id: "feature-2",
    title: "Protection",
    content:
      "We screen every payment for fraud before it clears, and card details are encrypted from the moment they're typed.",
  },
  {
    id: "feature-3",
    title: "Balance transfer",
    content:
      "Bring a balance over from another card and pay no interest on it for your first 12 months.",
  },
];

export const ledger = {
  rows: [
    { serial: "004217", customer: "Tidewater Dental", amount: 485, status: "Paid", paid: true },
    { serial: "004216", customer: "Finch Street Books", amount: 3060, status: "Paid", paid: true },
    { serial: "004215", customer: "Halcyon Yoga", amount: 240, status: "Due in 5 days", paid: false },
    { serial: "004214", customer: "Corner Garage", amount: 1125, status: "Reminder sent", paid: false },
  ],
};

export const appStores = [
  {
    id: "app-store",
    name: "Download on the App Store",
    badge: apple,
    link: "https://www.apple.com/app-store/",
  },
  {
    id: "google-play",
    name: "Get it on Google Play",
    badge: google,
    link: "https://play.google.com/store",
  },
];

export const steps = [
  {
    id: "step-1",
    title: "Tell us what you spend",
    content:
      "Answer five questions about your monthly spending. There's no credit check at this stage.",
  },
  {
    id: "step-2",
    title: "Compare the cards that fit",
    content:
      "We line up annual rates, annual fees and rewards side by side, so the cheapest card for you is obvious.",
  },
  {
    id: "step-3",
    title: "Apply in ten minutes",
    content:
      "Apply online and get a decision the same day. Your card arrives within a week.",
  },
];

export const stats = {
  people: "3,800",
  companies: "230",
  volume: "$230 million",
};

export const feedback = [
  {
    id: "feedback-1",
    content:
      "I used to spend Sunday nights chasing invoices. Now I find out I've been paid when my phone buzzes.",
    name: "Herman Jensen",
    title: "Founder, Jensen Joinery",
    img: people01,
  },
  {
    id: "feedback-2",
    content:
      "The card reader arrived on Tuesday and we took our first payment on Wednesday. There was nothing to set up.",
    name: "Steve Mark",
    title: "Owner, Mark's Cycle Repair",
    img: people02,
  },
  {
    id: "feedback-3",
    content:
      "I recommend it to my clients because the monthly statement is one page long and it's always right.",
    name: "Kenn Gallagher",
    title: "Director, Gallagher & Co.",
    img: people03,
  },
];

export const clients = [
  { id: "client-1", name: "Airbnb", logo: airbnb, ratio: 386 / 120 },
  { id: "client-2", name: "Binance", logo: binance, ratio: 385 / 78 },
  { id: "client-3", name: "Coinbase", logo: coinbase, ratio: 379 / 83 },
  { id: "client-4", name: "Dropbox", logo: dropbox, ratio: 386 / 76 },
];

export const footerLinks = [
  {
    title: "Useful links",
    links: [
      { name: "Content", link: "https://www.hoobank.com/content/" },
      { name: "How it works", link: "https://www.hoobank.com/how-it-works/" },
      { name: "Create", link: "https://www.hoobank.com/create/" },
      { name: "Explore", link: "https://www.hoobank.com/explore/" },
      { name: "Terms and services", link: "https://www.hoobank.com/terms-and-services/" },
    ],
  },
  {
    title: "Community",
    links: [
      { name: "Help center", link: "https://www.hoobank.com/help-center/" },
      { name: "Partners", link: "https://www.hoobank.com/partners/" },
      { name: "Suggestions", link: "https://www.hoobank.com/suggestions/" },
      { name: "Blog", link: "https://www.hoobank.com/blog/" },
      { name: "Newsletters", link: "https://www.hoobank.com/newsletters/" },
    ],
  },
  {
    title: "Partner",
    links: [
      { name: "Our partner", link: "https://www.hoobank.com/our-partner/" },
      { name: "Become a partner", link: "https://www.hoobank.com/become-a-partner/" },
    ],
  },
];

export const socialMedia = [
  { id: "social-media-1", name: "Instagram", icon: instagram, link: "https://www.instagram.com/" },
  { id: "social-media-2", name: "Facebook", icon: facebook, link: "https://www.facebook.com/" },
  { id: "social-media-3", name: "Twitter", icon: twitter, link: "https://www.twitter.com/" },
  { id: "social-media-4", name: "LinkedIn", icon: linkedin, link: "https://www.linkedin.com/" },
];
