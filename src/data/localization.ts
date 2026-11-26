import { formatCurrency } from '../engine/prng';
import {
  EventChoice,
  GameEventCard,
  LanguageCode,
  LoanRecord,
  TransactionRecord,
} from '../types/game';
import { CHARACTER_SIGNATURE_OPPORTUNITIES, EVENT_POOL } from './events';
import { getT } from './i18n';
import {
  ALL_HAPPINESS_ITEMS,
  CHARACTER_VENTURES,
  getHappinessItemName,
  getInsurancePlanName,
  getLotteryTicketName,
  getPersonalAssetName,
  INSURANCE_PLANS,
  LOTTERY_TICKETS,
  PERSONAL_ASSETS,
} from './lifestyle';
import { CRYPTO_CATALOG, FIXED_INCOME_PRODUCTS, PROPERTY_TEMPLATES, STOCK_CATALOG } from './markets';
import { PROFESSIONS } from './professions';

interface StockBnInfo {
  symbol: string;
  name: string;
  sector: string;
  description: string;
}

const STOCK_BN: Record<string, StockBnInfo> = {
  NVDAX: {
    symbol: 'নোভা',
    name: 'নোভাকোর সেমিকন্ডাক্টরস',
    sector: 'প্রযুক্তি',
    description: 'ডেটা সেন্টার ও আধুনিক কম্পিউটিং চিপ উৎপাদনকারী উচ্চ-প্রবৃদ্ধি সম্পন্ন প্রতিষ্ঠান।',
  },
  VLTG: {
    symbol: 'ভোল্ট',
    name: 'ভোল্টগ্রিড এনার্জি',
    sector: 'বিদ্যুৎ ও জ্বালানি',
    description: 'নিয়মিত মাসিক লভ্যাংশ প্রদানকারী সৌর ও গ্রিড বিদ্যুৎ কোম্পানি।',
  },
  HLTH: {
    symbol: 'হেলথ',
    name: 'মেরিডিয়ান বায়োহেলথ',
    sector: 'স্বাস্থ্যসেবা',
    description: 'স্থিতিশীল নগদ প্রবাহসহ আধুনিক ডায়াগনস্টিক ও চিকিৎসাসেবা নেটওয়ার্ক।',
  },
  APEX: {
    symbol: 'অ্যাপেক্স',
    name: 'অ্যাপেক্স ক্যাপিটাল হোল্ডিংস',
    sector: 'আর্থিক খাত',
    description: 'নিয়মিত ভালো লভ্যাংশ প্রদানকারী বাণিজ্যিক ব্যাংক ও ট্রেজারি প্রতিষ্ঠান।',
  },
  RVRB: {
    symbol: 'রিভার',
    name: 'রিভারবেন্ড ভোগ্যপণ্য',
    sector: 'নিত্যপ্রয়োজনীয় পণ্য',
    description: 'সব অর্থনৈতিক সময়েই স্থির চাহিদা ধরে রাখা গৃহস্থালি ব্র্যান্ড।',
  },
  TRNS: {
    symbol: 'ট্রান্স',
    name: 'ট্রান্সপোর্ট লজিস্টিকস ফান্ড',
    sector: 'শিল্প প্রপার্টি ফান্ড',
    description: 'গুদাম ভাড়া থেকে শেয়ারহোল্ডারদের উচ্চ হারে মাসিক লভ্যাংশ প্রদানকারী ফান্ড।',
  },
  CLDF: {
    symbol: 'ক্লাউড',
    name: 'ক্লাউডফর্জ সফটওয়্যার',
    sector: 'কর্পোরেট সফটওয়্যার',
    description: 'দ্রুত বর্ধনশীল ব্যবসায়িক সফটওয়্যার প্ল্যাটফর্ম, দর ওঠানামা তুলনামূলক বেশি।',
  },
  GOLDM: {
    symbol: 'সোনা',
    name: 'সোনা (গোল্ড রিজার্ভ)',
    sector: 'স্বর্ণ ও নিরাপদ সম্পদ',
    description: 'নিরাপদ সম্পদ—প্রতি মাসে মূল অ্যাকাউন্টে লভ্যাংশ জমা দেয় এবং কালো রাজহাঁস বা বাজার ধসের সময় সোনার দাম দ্রুত বেড়ে যায়।',
  },
};

const CRYPTO_BN: Record<string, { symbol: string; name: string; description: string }> = {
  BTCX: {
    symbol: 'বিটকোর',
    name: 'বিটকোর লেজার',
    description: 'শীর্ষ বিকেন্দ্রীভূত ডিজিটাল সম্পদ যার দর বড় চক্রাকারে ওঠানামা করে।',
  },
  ETHX: {
    symbol: 'ইথার',
    name: 'ইথারমেশ নেটওয়ার্ক',
    description: 'প্রোগ্রামেবল ডিজিটাল নেটওয়ার্ক টোকেন যা বাজার তারল্যের সাথে দ্রুত বদলায়।',
  },
  SOLX: {
    symbol: 'সোলিস',
    name: 'সোলিস চেইন',
    description: 'অত্যন্ত দ্রুতগতির কিন্তু ব্যাপক দর ওঠানামাযুক্ত ডিজিটাল টোকেন।',
  },
  VLTX: {
    symbol: 'ভল্ট',
    name: 'ভল্টপ্রোটোকল',
    description: 'উচ্চ-ঝুঁকিপূর্ণ অনুমাননির্ভর ডিজিটাল টোকেন—দর হঠাৎ বড় পরিবর্তন হতে পারে।',
  },
};

const FIXED_BN: Record<string, { name: string; description: string }> = {
  hy_savings: {
    name: 'রিজার্ভ উচ্চ-সুদ সঞ্চয়',
    description: 'বার্ষিক ৪.৫% হারে প্রতি মাসে সুদ প্রদানকারী তরল সঞ্চয়। যেকোনো সময় জরিমানা ছাড়া তোলা যায়।',
  },
  t_bill_3m: {
    name: '৩-মাসের ট্রেজারি বিল',
    description: 'স্বল্পমেয়াদী সরকারি সিকিউরিটি যা বার্ষিক ৫.৪% হারে প্রতি মাসে মূল অ্যাকাউন্টে সুদ দেয় এবং ৩ মাস পর আসল ফেরত দেয়।',
  },
  corp_bond_6m: {
    name: '৬-মাসের কর্পোরেট বন্ড',
    description: 'প্রতি মাসে বার্ষিক ৬.৪% হারে সুদ এবং ৬ মাস শেষে মূল টাকা ফেরত দেয়।',
  },
  infra_bond_12m: {
    name: '১২-মাসের অবকাঠামো বন্ড',
    description: '১২ মাস মেয়াদে বার্ষিক ৭.৬% হারে নিয়মিত মাসিক প্যাসিভ সুদ প্রদানকারী বন্ড।',
  },
};

const PROPERTY_BN: Record<string, { name: string; location: string; description: string }> = {
  'Oakwood Studio Condo': {
    name: 'ওকউড স্টুডিও ফ্ল্যাট',
    location: 'পূর্ব মেট্রো এলাকা',
    description: 'চাকরিজীবী ভাড়াটেদের চাহিদাসম্পন্ন ছোট ও সাশ্রয়ী ভাড়ার ফ্ল্যাট।',
  },
  'Maple Street 2-Bed House': {
    name: 'ম্যাপল স্ট্রিট ২-বেড বাড়ি',
    location: 'গ্রিনভিউ উপশহর',
    description: 'দীর্ঘমেয়াদী ভাড়াটে ও মূল্যবৃদ্ধির সুযোগসহ একক পারিবারিক বাড়ি।',
  },
  'Cedar Duplex (2 Units)': {
    name: 'সিডার ডুপ্লেক্স (২ ইউনিট)',
    location: 'বিশ্ববিদ্যালয় এলাকা',
    description: 'দুই ইউনিটের ভাড়ার ভবন—বৈচিত্র্যময় ভাড়া আয় ও শক্তিশালী নগদ প্রবাহ।',
  },
  'Harborview Fourplex': {
    name: 'হারবারভিউ ৪-ইউনিট ভবন',
    location: 'বন্দর চত্বর',
    description: 'আর্থিক স্বাধীনতা দ্রুত অর্জনের জন্য উপযোগী ৪ ইউনিটের আবাসিক প্রপার্টি।',
  },
  'Midtown Retail Corner': {
    name: 'মিডটাউন বাণিজ্যিক মার্কেট',
    location: 'মিডটাউন কেন্দ্র',
    description: 'ফার্মেসি ও ক্যাফে ভাড়াটেসহ ব্যস্ত বাণিজ্যিক দোকান কমপ্লেক্স।',
  },
  'Summit Logistics Warehouse': {
    name: 'সামিট লজিস্টিকস গুদাম',
    location: 'বাণিজ্য পার্ক',
    description: 'বহুবছর মেয়াদী চুক্তিতে ভাড়া দেওয়া আধুনিক শিল্প ও পণ্য সরবরাহ গুদাম।',
  },
  'Pinecrest Townhome': {
    name: 'পাইনক্রেস্ট টাউনহোম',
    location: 'নর্থ হিলস',
    description: 'কম রক্ষণাবেক্ষণ খরচ ও নির্ভরযোগ্য ভাড়া চাহিদাসহ আধুনিক ৩-বেডরুম বাড়ি।',
  },
  'Riverside 8-Unit Apartment': {
    name: 'রিভারসাইড ৮-ইউনিট অ্যাপার্টমেন্ট',
    location: 'নদীতীর এলাকা',
    description: 'প্রতি মাসে বড় অঙ্কের প্যাসিভ ভাড়া আয় এনে দেওয়া বৃহৎ অ্যাপার্টমেন্ট ব্লক।',
  },
  'Elmwood Distressed Duplex': {
    name: 'এলমউড ডিসকাউন্ট ডুপ্লেক্স',
    location: 'ওয়েস্টগেট এলাকা',
    description: 'বাজারদরের চেয়ে কম দামে ব্যক্তিগতভাবে প্রাপ্ত তাৎক্ষণিক ভাড়া-উপযোগী ২ ইউনিটের বাড়ি।',
  },
  'Station Square Condo': {
    name: 'স্টেশন স্কয়ার ফ্ল্যাট',
    location: 'কেন্দ্রীয় স্টেশন',
    description: 'কম ডাউন পেমেন্টে কেনা নিলামের ১-বেডরুম ফ্ল্যাট ও স্থির মাসিক ভাড়া আয়।',
  },
  'Economy Class Property': {
    name: 'ইকোনমি ক্লাস প্রপার্টি',
    location: 'আবাসিক এলাকা',
    description: 'সাশ্রয়ী আবাসিক ভবন যা নিয়মিত ৬–৮% বার্ষিক ভাড়া আয় প্রদান করে।',
  },
  'Standard Class Property': {
    name: 'স্ট্যান্ডার্ড ক্লাস অ্যাপার্টমেন্ট',
    location: 'নগর উপশহর',
    description: 'আধুনিক মাঝারি আকারের অ্যাপার্টমেন্ট ব্লক, স্থির ৫–৭% ভাড়া আয়সহ।',
  },
  'Premium Class Property': {
    name: 'প্রিমিয়াম ক্লাস কমপ্লেক্স',
    location: 'কেন্দ্রীয় মেট্রো',
    description: 'উন্নত মানের আবাসিক ও বাণিজ্যিক প্রপার্টি, ৪–৬% ভাড়া আয়সহ।',
  },
  'Luxury Class Property': {
    name: 'বিলাসবহুল শ্রেণী এস্টেট',
    location: 'প্রাইম ডিস্ট্রিক্ট',
    description: 'অভিজাত বিলাসবহুল প্রপার্টি—উচ্চ সম্পদমূল্য ও ২–৪% ভাড়া আয়।',
  },
};

const BUSINESS_BN: Record<string, { name: string; category: string; description: string }> = {
  '24/7 Express Laundromat': {
    name: '২৪/৭ এক্সপ্রেস লন্ড্রোম্যাট',
    category: 'স্থানীয় সেবা',
    description: 'কার্ড-চালিত ও স্বয়ংক্রিয় ব্যবস্থাপনায় চলা ব্যস্ত পাড়ার লন্ড্রি ব্যবসা।',
  },
  'Artisan Coffee Micro-Roastery': {
    name: 'আর্টিসান কফি রোস্টারি',
    category: 'খাদ্য ও পানীয়',
    description: 'ভালো লাভজনক বিশেষায়িত কফি শপ; ম্যানেজার নিয়োগের আগে মালিকের তত্ত্বাবধান প্রয়োজন।',
  },
  'Vending Route (14 Smart Kiosks)': {
    name: 'স্মার্ট ভেন্ডিং রুট (১৪ মেশিন)',
    category: 'স্বয়ংক্রিয় খুচরা',
    description: 'অফিস ভবনে বসানো স্বয়ংক্রিয় স্ন্যাকস মেশিন, ঠিকাদারের মাধ্যমে পরিচালিত।',
  },
  'Automated Tunnel Car Wash': {
    name: 'স্বয়ংক্রিয় টানেল কার ওয়াশ',
    category: 'অটোমোবাইল',
    description: 'সদস্যপদ ভিত্তিক আধুনিক স্বয়ংক্রিয় কার ওয়াশ যা নিয়মিত প্যাসিভ আয় দেয়।',
  },
  'Boutique Fitness Studio': {
    name: 'বুটিক ফিটনেস স্টুডিও',
    category: 'স্বাস্থ্য ও ফিটনেস',
    description: 'উচ্চ আয়ের ফিটনেস স্টুডিও; প্যাসিভ আয়ের জন্য স্বয়ংক্রিয় আপগ্রেড প্রয়োজন।',
  },
  'Micro-SaaS Billing Tool': {
    name: 'মাইক্রো বিলিং সফটওয়্যার',
    category: 'ডিজিটাল সফটওয়্যার',
    description: 'স্বল্প মূলধনে ব্যবসার ইনভয়েসিং সফটওয়্যার শুরু করুন; পরে সাপোর্ট স্বয়ংক্রিয় করা যাবে।',
  },
  'E-Commerce Pet Supply Brand': {
    name: 'অনলাইন পোষা প্রাণীর পণ্য ব্র্যান্ড',
    category: 'ই-কমার্স',
    description: 'সাবস্ক্রিপশন ভিত্তিক পোষা প্রাণীর খাবার ও সরঞ্জামের অনলাইন স্টোর।',
  },
  'Solar Rooftop Leasing Co.': {
    name: 'সোলার রুফটপ লিজিং কোম্পানি',
    category: 'সবুজ প্রযুক্তি',
    description: 'বাণিজ্যিক ছাদে সৌর প্যানেল ভাড়া দিয়ে প্রতি মাসে নিশ্চিত আয়কারী প্রতিষ্ঠান।',
  },
  'SmartDrop Parcel Lockers': {
    name: 'স্মার্টড্রপ পার্সেল লকার',
    category: 'স্বয়ংক্রিয় অবকাঠামো',
    description: '৮টি আবাসিক ভবনে বসানো স্বয়ংক্রিয় পার্সেল লকার নেটওয়ার্ক থেকে স্থির মাসিক আয়।',
  },
};

const BIZ_CATEGORY_BN: Record<string, string> = {
  'Local Services': 'স্থানীয় সেবা',
  'Food & Beverage': 'খাদ্য ও পানীয়',
  'Automated Retail': 'স্বয়ংক্রিয় খুচরা',
  Automotive: 'অটোমোবাইল',
  Wellness: 'স্বাস্থ্য ও ফিটনেস',
  'Digital Software': 'ডিজিটাল সফটওয়্যার',
  'Direct-to-Consumer': 'ই-কমার্স',
  'Clean Tech': 'সবুজ প্রযুক্তি',
  'Automated Infrastructure': 'স্বয়ংক্রিয় অবকাঠামো',
};

const EVENT_BN: Record<
  string,
  { title: string; description: string; impact: string }
> = {
  opp_stock_nvda_block: {
    title: 'বিশেষ শেয়ার প্রস্তাব',
    description: 'একজন ব্রোকার বাজারদরের চেয়ে ছাড়ে অফ-মার্কেট শেয়ার ব্লক বিক্রির প্রস্তাব দিচ্ছেন।',
    impact: 'ছাড়কৃত দামে শেয়ার কেনার সুযোগ (আপনার সিদ্ধান্ত প্রয়োজন)',
  },
  opp_stock_vltg_block: {
    title: 'ডিভিডেন্ড শেয়ার অফার',
    description: 'একজন অবসরপ্রাপ্ত সহকর্মী ছাড়ে শেয়ার দ্রুত বিক্রি করতে চান।',
    impact: 'ছাড়কৃত দামে শেয়ার কিনুন + নিয়মিত মাসিক লভ্যাংশ',
  },
  opp_property_distressed_duplex: {
    title: 'বাজারদরের নিচে ডুপ্লেক্স বাড়ি',
    description: 'জরুরি অর্থের প্রয়োজনে একজন বিক্রেতা বাজারদরের চেয়ে কম মূল্যে ২ ইউনিটের ডুপ্লেক্স বিক্রি করছেন।',
    impact: 'ছাড়কৃত দামে ডুপ্লেক্স কেনার সুযোগ',
  },
  opp_property_starter_condo: {
    title: 'ব্যাংক নিলামের ফ্ল্যাট সুযোগ',
    description: 'ব্যাংক নিলামের একটি ১-বেডরুম ভাড়ার ফ্ল্যাট সুবিধাজনক শর্তে পাওয়া যাচ্ছে।',
    impact: 'কম ডাউন পেমেন্টে ফ্ল্যাট কেনার সুযোগ',
  },
  opp_business_kiosk_partner: {
    title: 'স্বয়ংক্রিয় পার্সেল লকার নেটওয়ার্ক',
    description: '৮টি আবাসিক ভবনের লবিতে ইতিমধ্যেই বসানো প্রস্তুত পার্সেল-লকার ব্যবসায় অংশীদার হোন।',
    impact: 'স্বয়ংক্রিয় ব্যবসা থেকে প্যাসিভ আয় সুযোগ',
  },
  opp_side_consulting: {
    title: 'সাপ্তাহিক পরামর্শ চুক্তি',
    description: 'পরিচিত একটি প্রতিষ্ঠানের পক্ষ থেকে সাপ্তাহিক কর্মশালা ও পরামর্শ প্রদানের আমন্ত্রণ এসেছে।',
    impact: 'তাৎক্ষণিক নগদ আয় (ঐচ্ছিক কাজ)',
  },
  opp_royalty_license: {
    title: 'ডিজিটাল টেমপ্লেট লাইসেন্সিং চুক্তি',
    description: 'একটি বিশেষ টুলকিট লাইসেন্স করুন যা প্রতি মাসে স্থায়ী রয়্যালটি আয় দেবে।',
    impact: 'স্থায়ী অন্যান্য প্যাসিভ আয় যুক্ত করার সুযোগ',
  },
  opp_board_game_publish: {
    title: 'বোর্ড গেমের প্রকাশনা',
    description: 'একটি নতুন বোর্ড গেম বাজারে প্রকাশের যৌথ উদ্যোগে বিনিয়োগ করুন। সফল হলে মাস শেষে বড় অঙ্কের মুনাফা মিলবে।',
    impact: 'বিনিয়োগে উচ্চ মুনাফার সম্ভাবনা (ফলাফল সারসংক্ষেপে)',
  },
  opp_medical_conference: {
    title: 'চিকিৎসা সম্মেলন',
    description: 'আপনাকে একটি গুরুত্বপূর্ণ স্বাস্থ্যসেবা বিষয়ক অনুষ্ঠানে বক্তৃতা দেওয়ার জন্য আমন্ত্রণ জানানো হয়েছে। বক্তৃতার পারিশ্রমিক অর্জনের জন্য একটি উপস্থাপনা দিন, তবে যাতায়াত খরচের কথাও মাথায় রাখবেন।',
    impact: 'বক্তার পারিশ্রমিক ও ভ্রমণ খরচ',
  },
  exp_medical: {
    title: 'অপ্রত্যাশিত চিকিৎসা ও দন্ত ব্যয়',
    description: 'জরুরি চিকিৎসার জন্য এমন কিছু খরচ এসেছে যা আপনার সাধারণ বীমার আওতায় পড়ে না।',
    impact: 'জরুরি চিকিৎসা ব্যয় (নগদ অথবা ঋণে পরিশোধ)',
  },
  exp_car_repair: {
    title: 'গাড়ির জরুরি মেরামত খরচ',
    description: 'প্রতিদিনের যাতায়াতের গাড়িটি সচল রাখতে এখনই ট্রান্সমিশন মেরামত করাতে হবে।',
    impact: 'গাড়ির জরুরি মেরামত ব্যয়',
  },
  exp_home_repair: {
    title: 'ঝড়ে ছাদ ও প্লাম্বিং মেরামত',
    description: 'মৌসুমি ঝড়ো আবহাওয়ায় ছাদ ও পানির লাইনের জরুরি মেরামতের প্রয়োজন হয়েছে।',
    impact: 'জরুরি বাড়ি মেরামত ব্যয়',
  },
  exp_family: {
    title: 'জরুরি পারিবারিক সহায়তা',
    description: 'একজন নিকটাত্মীয় হঠাৎ আর্থিক সংকটে পড়েছেন এবং এই মাসে সহায়তার অনুরোধ করেছেন।',
    impact: 'জরুরি পারিবারিক ব্যয়',
  },
  exp_tax_bill: {
    title: 'পৌর কর সমন্বয় বিল',
    description: 'বাৎসরিক কর পুনর্মূল্যায়নের ফলে এই মাসে এককালীন বকেয়া কর পরিশোধ করতে হবে।',
    impact: 'কর সমন্বয় ব্যয়',
  },
  exp_education: {
    title: 'পেশাগত লাইসেন্স নবায়ন',
    description: 'এই মাসে পেশাগত সনদ নবায়ন ও বাধ্যতামূলক প্রশিক্ষণ ফি জমা দিতে হবে।',
    impact: 'পেশাগত নবায়ন ব্যয়',
  },
  life_salary_raise: {
    title: 'বার্ষিক দক্ষতা ভিত্তিক বেতন বৃদ্ধি',
    description: 'চমৎকার কাজের স্বীকৃতি হিসেবে আপনার মাসিক বেতন স্থায়ীভাবে বৃদ্ধি পেয়েছে।',
    impact: 'মাসিক বেতন স্থায়ীভাবে বৃদ্ধি',
  },
  life_promotion: {
    title: 'উচ্চতর পদে পদোন্নতি ও বোনাস',
    description: 'আপনি সিনিয়র পদে পদোন্নতি পেয়েছেন—মাসিক বেতন বৃদ্ধি ও তাৎক্ষণিক নগদ বোনাস!',
    impact: 'মাসিক বেতন বৃদ্ধি ও তাৎক্ষণিক বোনাস',
  },
  life_salary_cut: {
    title: 'বিভাগীয় বাজেট সংকোচন',
    description: 'অর্থনৈতিক মন্দার কারণে ওভারটাইম ও ভাতা কমে যাওয়ায় মাসিক বেতন হ্রাস পেয়েছে।',
    impact: 'মাসিক বেতন সমন্বয়',
  },
  life_market_crash: {
    title: 'কালো রাজহাঁস: আকস্মিক বাজার ধস',
    description: 'অপ্রত্যাশিত কালো রাজহাঁস ধসে শেয়ার ও ক্রিপ্টো বাজার পড়ে গেছে, তবে সোনার দাম দ্রুত বেড়েছে।',
    impact: 'শেয়ার ও ক্রিপ্টো ধস · সোনা ধারীরা লাভে',
  },
  life_property_boom: {
    title: 'মেট্রো ট্রানজিট সম্প্রসারণ অনুমোদিত',
    description: 'নতুন আঞ্চলিক রেল প্রকল্পের ফলে শহরজুড়ে সব প্রপার্টির বাজারমূল্য বৃদ্ধি পেয়েছে।',
    impact: 'আপনার মালিকানাধীন সব প্রপার্টির মূল্য বাড়বে',
  },
  life_new_baby: {
    title: 'নতুন সন্তানের জন্ম হয়েছে!',
    description: 'অভিনন্দন! আপনার পরিবারে নতুন অতিথি এসেছে—এতে সুখ বাড়বে এবং মাসিক পরিবার খরচ কিছুটা বাড়বে।',
    impact: 'সুখ বাড়বে · মাসিক পারিবারিক ও শিক্ষা ব্যয় যুক্ত হবে',
  },
  life_divorce: {
    title: 'বিবাহ বিচ্ছেদ ও মীমাংসা',
    description: 'অপ্রত্যাশিত পারিবারিক জটিলতায় বিবাহ বিচ্ছেদ ঘটেছে, আইনি খরচ ও মানসিক চাপ সৃষ্টি হয়েছে।',
    impact: 'বৈবাহিক অবস্থা তালাকপ্রাপ্ত হবে · অর্থ ও সুখ কমবে',
  },
};

export function localizeProfession(
  profId: string,
  lang: LanguageCode
): { name: string; title: string; desc: string } {
  const fallback = PROFESSIONS.find((p) => p.id === profId) ?? PROFESSIONS[0];
  const pack = getT(lang).professionNames[profId];
  return {
    name: pack?.name ?? fallback.name,
    title: pack?.title ?? fallback.title,
    desc: pack?.desc ?? fallback.description,
  };
}

export function localizeStock(symbol: string, lang: LanguageCode): StockBnInfo {
  const def = STOCK_CATALOG.find((s) => s.symbol === symbol) ?? STOCK_CATALOG[0];
  if (lang === 'bn' && STOCK_BN[symbol]) {
    return STOCK_BN[symbol];
  }
  return {
    symbol: def.symbol,
    name: def.name,
    sector: def.sector,
    description: def.description,
  };
}

export function localizeCrypto(symbol: string, lang: LanguageCode) {
  const def = CRYPTO_CATALOG.find((c) => c.symbol === symbol) ?? CRYPTO_CATALOG[0];
  if (lang === 'bn' && CRYPTO_BN[symbol]) {
    return CRYPTO_BN[symbol];
  }
  return {
    symbol: def.symbol,
    name: def.name,
    description: def.description,
  };
}

export function localizeFixedIncome(productId: string, fallbackName: string, lang: LanguageCode) {
  const def = FIXED_INCOME_PRODUCTS.find((f) => f.id === productId);
  if (lang === 'bn' && FIXED_BN[productId]) {
    return FIXED_BN[productId];
  }
  return {
    name: def?.name ?? fallbackName,
    description: def?.description ?? '',
  };
}

export function localizeProperty(
  name: string,
  location: string,
  description: string | undefined,
  lang: LanguageCode
) {
  const tplDesc =
    description ??
    PROPERTY_TEMPLATES.find((p) => p.name === name)?.description ??
    '';
  if (lang === 'bn' && PROPERTY_BN[name]) {
    return {
      name: PROPERTY_BN[name].name,
      location: PROPERTY_BN[name].location,
      description: PROPERTY_BN[name].description,
    };
  }
  return { name, location, description: tplDesc };
}

export function localizeBusiness(
  name: string,
  category: string,
  description: string | undefined,
  lang: LanguageCode
) {
  if (lang === 'bn') {
    const known = BUSINESS_BN[name];
    if (known) {
      return known;
    }
    return {
      name,
      category: BIZ_CATEGORY_BN[category] ?? category,
      description: description ?? '',
    };
  }
  return { name, category, description: description ?? '' };
}

export function localizeLoanName(loan: LoanRecord, lang: LanguageCode): string {
  if (lang !== 'bn') return loan.name;
  if (loan.id === 'init_bank_loan') return 'ব্যাংক শিক্ষা ও প্রারম্ভিক ঋণ';
  if (loan.id === 'init_credit_card') return 'ক্রেডিট কার্ড বকেয়া';
  if (loan.id === 'init_other_loan') return 'গাড়ি ও ব্যক্তিগত দায়';
  if (loan.name === 'Personal Term Loan') return 'ব্যক্তিগত মেয়াদী ঋণ';
  if (loan.name === 'Business Expansion Facility') return 'ব্যবসা সম্প্রসারণ ঋণ';
  if (loan.name === 'Bank Consolidation Loan') return 'ব্যাংক একীভূতকরণ ঋণ';
  if (loan.name === 'Personal Credit Facility') return 'ব্যক্তিগত ক্রেডিট সুবিধা';
  if (loan.name.startsWith('Mortgage: ')) {
    const propName = loan.name.slice('Mortgage: '.length);
    const bnProp = PROPERTY_BN[propName]?.name ?? propName;
    return `মর্টগেজ: ${bnProp}`;
  }
  if (loan.name.startsWith('Emergency Credit Line')) {
    const match = loan.name.match(/Y(\d+)\s+M(\d+)/);
    return match
      ? `জরুরি ওভারড্রাফট ঋণ (ব${match[1]} মা${match[2]})`
      : 'জরুরি ওভারড্রাফট ঋণ';
  }
  if (loan.name.startsWith('Emergency Loan (')) {
    const inner = loan.name.slice('Emergency Loan ('.length, -1);
    const matchedEvt = Object.entries(EVENT_BN).find(([, v]) => {
      const enTpl = EVENT_POOL.find((e) => e.title === inner);
      return enTpl && EVENT_BN[enTpl.id]?.title === v.title;
    });
    const enTpl = EVENT_POOL.find((e) => e.title === inner);
    const localizedInner = enTpl && EVENT_BN[enTpl.id] ? EVENT_BN[enTpl.id].title : inner;
    void matchedEvt;
    return `জরুরি ঋণ (${localizedInner})`;
  }
  return loan.name;
}

function localizeEventChoice(
  choice: EventChoice,
  templateId: string,
  lang: LanguageCode
): EventChoice {
  if (lang !== 'bn') return choice;

  const tpl = EVENT_POOL.find((t) => t.id === templateId);
  const kind = tpl?.kind;

  if (choice.id === 'decline' || choice.id === 'skip_gig') {
    const declineMap: Record<string, { label: string; desc: string }> = {
      stock_discount: {
        label: 'প্রস্তাব প্রত্যাখ্যান করুন',
        desc: 'নগদ অর্থ হাতে রাখুন এবং এই প্রস্তাব এড়িয়ে যান।',
      },
      property_deal: {
        label: 'চুক্তি এড়িয়ে যান',
        desc: 'এই ব্যক্তিগত প্রপার্টি প্রস্তাবটি গ্রহণ না করা।',
      },
      business_deal: {
        label: 'অংশীদারিত্ব এড়িয়ে যান',
        desc: 'অন্যান্য সুযোগের জন্য নগদ টাকা সংরক্ষণ করুন।',
      },
      side_hustle: {
        label: 'প্রত্যাখ্যান করুন',
        desc: 'এই মাসে অতিরিক্ত কাজটি না নেওয়া।',
      },
      other_passive_income: {
        label: 'এড়িয়ে যান',
        desc: 'লাইসেন্সিং চুক্তিটি গ্রহণ না করা।',
      },
    };
    const item = declineMap[kind ?? ''] ?? {
      label: 'এড়িয়ে যান',
      desc: 'এই প্রস্তাবটি গ্রহণ না করে এগিয়ে যান।',
    };
    return { ...choice, label: item.label, description: item.desc };
  }

  if (choice.id === 'buy_block') {
    const sym = choice.symbol ?? 'NVDAX';
    const bnSym = STOCK_BN[sym]?.symbol ?? sym;
    const shares = choice.shares ?? 25;
    const offerPrice = choice.amount ?? 0;
    const total = Math.round(offerPrice * shares * 100) / 100;
    return {
      ...choice,
      label: `${shares}টি ${bnSym} কিনুন (${formatCurrency(total)})`,
      description: 'হাতে থাকা নগদ অর্থ দিয়ে ছাড়কৃত দামে শেয়ার কিনুন।',
    };
  }

  if (choice.id === 'buy_financed' && choice.propertyTemplate) {
    const pt = choice.propertyTemplate;
    return {
      ...choice,
      label: `মর্টগেজে কিনুন (${formatCurrency(pt.downPayment)} ডাউন)`,
      description: `ডাউন পেমেন্ট ${formatCurrency(pt.downPayment)}, ঋণ ${formatCurrency(pt.loanAmount)}, মাসিক ভাড়া +${formatCurrency(pt.monthlyRentalIncome)}/মাস`,
    };
  }

  if (choice.id === 'buy_biz' && choice.businessTemplate) {
    const bt = choice.businessTemplate;
    const net = bt.monthlyRevenue - bt.monthlyOperatingExpenses;
    return {
      ...choice,
      label: `বিনিয়োগ করুন ${formatCurrency(bt.purchasePrice)}`,
      description: `স্বয়ংক্রিয় ব্যবসা থেকে মাসে +${formatCurrency(net)}/মাস নিট প্যাসিভ মুনাফা।`,
    };
  }

  if (choice.id === 'accept_gig') {
    return {
      ...choice,
      label: `চুক্তি গ্রহণ করুন (+${formatCurrency(choice.amount ?? 0)})`,
      description: 'পরামর্শ কাজটি সম্পন্ন করে হাতে নগদ অর্থ যোগ করুন।',
    };
  }

  if (choice.id === 'fund_license') {
    return {
      ...choice,
      label: `${formatCurrency(choice.amount ?? 0)} বিনিয়োগ (+${formatCurrency(choice.secondaryAmount ?? 0)}/মাস)`,
      description: `${formatCurrency(choice.amount ?? 0)} পরিশোধ করে প্রতি মাসে স্থায়ী +${formatCurrency(choice.secondaryAmount ?? 0)} রয়্যালটি আয় যোগ করুন।`,
    };
  }

  if (choice.id === 'fund_venture') {
    return {
      ...choice,
      label: `${formatCurrency(choice.amount ?? 0)} বিনিয়োগ করুন`,
      description: 'প্রকাশনার প্রাথমিক খরচ পরিশোধ করুন — ফলাফল মাস শেষে সারসংক্ষেপে দেখা যাবে।',
    };
  }

  if (choice.id === 'accept_conference') {
    return {
      ...choice,
      label: `সম্মেলনে যোগ দিন (${formatCurrency(choice.amount ?? 0)} খরচ → ${formatCurrency(choice.secondaryAmount ?? 0)} পারিশ্রমিক)`,
      description: 'ভ্রমণ খরচ পরিশোধ করে বক্তৃতার পারিশ্রমিক সারসংক্ষেপে গ্রহণ করুন।',
    };
  }

  if (choice.id === 'pay_cash') {
    const cost = Math.abs(choice.amount ?? 0);
    return {
      ...choice,
      label: `নগদ থেকে ${formatCurrency(cost)} পরিশোধ করুন`,
      description: 'হাতে থাকা নগদ অর্থ থেকে তাৎক্ষণিক বিলটি মিটিয়ে ফেলুন।',
    };
  }

  if (choice.id === 'finance_emergency') {
    const cost = choice.amount ?? 0;
    return {
      ...choice,
      label: `জরুরি ঋণে পরিশোধ (${formatCurrency(cost)})`,
      description: '১৬% বার্ষিক সুদে ২৪-মাসের ব্যক্তিগত ঋণের মাধ্যমে বিল পরিশোধ করুন।',
    };
  }

  if (choice.id === 'ack_raise') {
    const pct = Math.round(((choice.secondaryAmount ?? 1.08) - 1) * 100);
    return {
      ...choice,
      label: 'বেতন বৃদ্ধি গ্রহণ করুন',
      description: `আপনার মাসিক বেতন স্থায়ীভাবে ${pct}% বৃদ্ধি পাবে।`,
    };
  }

  if (choice.id === 'accept_promo') {
    return {
      ...choice,
      label: `পদোন্নতি গ্রহণ (+${formatCurrency(choice.secondaryAmount ?? 0)}/মাস ও +${formatCurrency(choice.amount ?? 0)})`,
      description: 'তাৎক্ষণিক বোনাস নগদে যোগ হবে এবং মাসিক বেতন বাড়বে।',
    };
  }

  if (choice.id === 'ack_cut') {
    const pct = Math.round(((choice.secondaryAmount ?? 0.93) - 1) * 100);
    return {
      ...choice,
      label: 'সমন্বয় গ্রহণ করুন',
      description: `মাসিক বেতন ${pct}% পরিবর্তিত হবে।`,
    };
  }

  if (choice.id === 'ack_crash') {
    const dropPct = Math.round((1 - (choice.secondaryAmount ?? 0.78)) * 100);
    return {
      ...choice,
      label: `কালো রাজহাঁস ধস (-${dropPct}%)`,
      description: 'শেয়ার ও ক্রিপ্টো দ্রুত পড়ে যাবে, তবে সোনার দাম বড় লাফে বাড়বে।',
    };
  }

  if (choice.id === 'ack_boom') {
    const boomPct = Math.round(((choice.secondaryAmount ?? 1.12) - 1) * 100);
    return {
      ...choice,
      label: `প্রপার্টি পুনর্মূল্যায়ন (+${boomPct}%)`,
      description: 'মালিকানাধীন সব প্রপার্টির বর্তমান মূল্য হালনাগাদ হবে।',
    };
  }

  if (choice.id === 'welcome_baby') {
    return {
      ...choice,
      label: `সন্তানকে স্বাগতম (${formatCurrency(choice.amount ?? 0)})`,
      description: `সুখ +১৪ এবং প্রতি মাসে +${formatCurrency(choice.secondaryAmount ?? 0)} লালন-পালন খরচ যুক্ত হবে।`,
    };
  }

  if (choice.id === 'ack_divorce') {
    return {
      ...choice,
      label: `বিচ্ছেদ মীমাংসা (-${formatCurrency(choice.amount ?? 0)})`,
      description: 'মীমাংসার অর্থ পরিশোধ হবে এবং বৈবাহিক অবস্থা তালাকপ্রাপ্ত হবে।',
    };
  }

  if (choice.id === 'fund_signature') {
    const cost = choice.amount ?? 300;
    const maxPay = choice.secondaryAmount ?? Math.round(cost * 1.44);
    return {
      ...choice,
      label: `বিনিয়োগ ${formatCurrency(cost)}`,
      description: `সারসংক্ষেপে সম্ভাব্য ফেরত ${formatCurrency(maxPay)} পর্যন্ত।`,
    };
  }

  return choice;
}

function localizeResolutionNote(
  note: string | undefined,
  evt: GameEventCard,
  lang: LanguageCode
): string | undefined {
  if (!note || lang !== 'bn') return note;
  if (note === 'Opportunity expired at end of month.') return 'মাস শেষে সুযোগের মেয়াদ শেষ হয়েছে।';
  if (note === 'Annual opportunity expired after 12 months.') return '১২ মাস মেয়াদ শেষে বার্ষিক সুযোগটি শেষ হয়েছে।';
  if (note === 'Passed / Declined') return 'এড়িয়ে যাওয়া / প্রত্যাখ্যাত';
  if (note === 'Ignored' || note === 'Ignored (Events disabled).') return 'উপেক্ষা করা হয়েছে';
  if (note === 'Pending month-end settlement') return 'বিনিয়োগকৃত — মাস শেষে ফলাফল দেখা যাবে';
  if (evt.chosenChoiceId) {
    const matched = evt.choices.find((c) => c.id === evt.chosenChoiceId);
    if (matched) {
      return localizeEventChoice(matched, evt.templateId, lang).label;
    }
  }
  if (note.startsWith('Salary updated to ')) {
    const amt = note.match(/\$[\d,]+/)?.[0] ?? '';
    return `বেতন হালনাগাদ হয়েছে ${amt}/মাস`;
  }
  if (note.startsWith('Financed ')) {
    const amounts = note.match(/\$[\d,]+/g) ?? [];
    if (amounts.length >= 2) return `ঋণে পরিশোধিত ${amounts[0]} (${amounts[1]}/মাস)`;
  }
  if (note.includes('real estate values increased')) {
    const pct = note.match(/\+\d+%/)?.[0] ?? '';
    return `সব প্রপার্টির মূল্য ${pct} বেড়েছে।`;
  }
  if (note.startsWith('Equities & crypto repriced lower') || note.startsWith('Black Swan crash:')) {
    const pct = note.match(/\+\d+%/)?.[0] ?? '';
    const amt = note.match(/\+\$[\d,.]+/)?.[0] ?? '';
    return amt
      ? `কালো রাজহাঁস ধসে বাজার পড়েছে, আর সোনা ${pct} বেড়ে আপনার ${amt} লাভ হয়েছে।`
      : `কালো রাজহাঁস ধসে বাজার পড়েছে, তবে সোনা ${pct} বেড়েছে।`;
  }
  return localizeTransactionText(note, lang);
}

export function localizeEventCard(evt: GameEventCard, lang: LanguageCode): GameEventCard {
  if (lang !== 'bn') return evt;
  const bn = EVENT_BN[evt.templateId];
  let title = bn?.title ?? evt.title;
  let description = bn?.description ?? evt.description;
  let impact = bn?.impact ?? evt.financialImpactSummary;

  if (evt.templateId === 'opp_stock_nvda_block' || evt.templateId === 'opp_stock_vltg_block') {
    const buyChoice = evt.choices.find((c) => c.id === 'buy_block');
    if (buyChoice && buyChoice.amount) {
      const shares = buyChoice.shares ?? 25;
      const offerPrice = buyChoice.amount;
      const total = Math.round(offerPrice * shares);
      const symKey = buyChoice.symbol ?? 'NVDAX';
      const stockInfo = STOCK_BN[symKey];
      const sym = stockInfo?.symbol ?? symKey;
      const stockName = stockInfo?.name ?? sym;
      const disc = buyChoice.secondaryAmount;
      title = `${bn?.title ?? 'বিশেষ শেয়ার প্রস্তাব'}: ${stockName}`;
      description = disc
        ? `বাজারদরের চেয়ে ${disc}% ছাড়ে ${stockName}-এর ${shares}টি শেয়ার অফ-মার্কেটে কেনার সুযোগ।`
        : `${stockName}-এর ${shares}টি শেয়ার ছাড়কৃত দরে কেনার সুযোগ।`;
      impact = `${formatCurrency(total)} মূল্যে ${shares}টি ${sym} শেয়ার কিনুন (অফার দর ${formatCurrency(offerPrice)}/শেয়ার)`;
    }
  } else if (
    evt.templateId === 'opp_property_distressed_duplex' ||
    evt.templateId === 'opp_property_starter_condo'
  ) {
    const pt = evt.choices.find((c) => c.id === 'buy_financed')?.propertyTemplate;
    if (pt) {
      description = `${bn?.description ?? ''} ডাউন পেমেন্ট ${formatCurrency(pt.downPayment)}।`;
      impact = `দাম ${formatCurrency(pt.purchasePrice)} · ডাউন পেমেন্ট ${formatCurrency(pt.downPayment)} · ভাড়া ${formatCurrency(pt.monthlyRentalIncome)}/মাস · রক্ষণাবেক্ষণ ${formatCurrency(pt.maintenanceExpense)}/মাস`;
    }
  } else if (evt.templateId === 'opp_business_kiosk_partner') {
    const bt = evt.choices.find((c) => c.id === 'buy_biz')?.businessTemplate;
    if (bt) {
      impact = `খরচ ${formatCurrency(bt.purchasePrice)} · প্যাসিভ আয় ${formatCurrency(bt.monthlyRevenue)}/মাস · পরিচালনা ব্যয় ${formatCurrency(bt.monthlyOperatingExpenses)}/মাস`;
    }
  } else if (evt.templateId === 'opp_side_consulting') {
    const bonus = evt.choices.find((c) => c.id === 'accept_gig')?.amount ?? 0;
    impact = `তাৎক্ষণিক নগদ +${formatCurrency(bonus)} আয় (ঐচ্ছিক কাজ)`;
  } else if (evt.templateId === 'opp_royalty_license') {
    const c = evt.choices.find((ch) => ch.id === 'fund_license');
    const cost = c?.amount ?? 0;
    const gain = c?.secondaryAmount ?? 0;
    description = `${formatCurrency(cost)} বিনিয়োগ করে একটি বিশেষ টুলকিট লাইসেন্স করুন যা প্রতি মাসে স্থায়ী রয়্যালটি আয় দেবে।`;
    impact = `বিনিয়োগ ${formatCurrency(cost)} · প্রতি মাসে +${formatCurrency(gain)} অন্যান্য প্যাসিভ আয়`;
  } else if (evt.templateId === 'opp_board_game_publish') {
    const c = evt.choices.find((ch) => ch.id === 'fund_venture');
    const cost = c?.amount ?? 1400;
    const maxPay = c?.secondaryAmount ?? 3600;
    description = `বোর্ড গেমের প্রকাশনায় ${formatCurrency(cost)} বিনিয়োগ করুন। সফল হলে সারসংক্ষেপে সর্বোচ্চ ${formatCurrency(maxPay)} পর্যন্ত আয় হতে পারে!`;
    impact = `বিনিয়োগ ${formatCurrency(cost)} · সম্ভাব্য আয় ${formatCurrency(maxPay)}`;
  } else if (evt.templateId === 'opp_medical_conference') {
    const c = evt.choices.find((ch) => ch.id === 'accept_conference');
    const travel = c?.amount ?? 1200;
    const fee = c?.secondaryAmount ?? 2600;
    impact = `বক্তার পারিশ্রমিক: ${formatCurrency(fee)} · ভ্রমণ খরচ: ${formatCurrency(travel)}`;
  } else if (evt.templateId.startsWith('char_opp_')) {
    const sigCfg = Object.values(CHARACTER_SIGNATURE_OPPORTUNITIES).find(
      (s) => s.templateId === evt.templateId
    );
    const c = evt.choices.find((ch) => ch.id === 'fund_signature');
    const cost = c?.amount ?? sigCfg?.baseCost ?? 300;
    const minPay = Math.round((cost * (1 + (sigCfg?.minReturnPct ?? 22) / 100)) / 10) * 10;
    const maxPay = c?.secondaryAmount ?? Math.round((cost * (1 + (sigCfg?.maxReturnPct ?? 44) / 100)) / 10) * 10;
    if (sigCfg) {
      title = sigCfg.titleBn;
      description = `${sigCfg.descBn} (বিনিয়োগ ${formatCurrency(cost)} · সম্ভাব্য মোট ফেরত ${formatCurrency(minPay)}–${formatCurrency(maxPay)})।`;
      impact = `বিনিয়োগ ${formatCurrency(cost)} · সম্ভাব্য ফেরত ${formatCurrency(minPay)} - ${formatCurrency(maxPay)}`;
    }
  } else if (evt.category === 'expense_emergency') {
    const cost = Math.abs(evt.choices.find((c) => c.id === 'pay_cash')?.amount ?? 0);
    impact = `-${formatCurrency(cost)} নগদ খরচ (অথবা জরুরি ঋণে পরিশোধ)`;
  } else if (evt.templateId === 'life_salary_raise') {
    const pct = Math.round(((evt.choices[0]?.secondaryAmount ?? 1.08) - 1) * 100);
    description = `চমৎকার কাজের স্বীকৃতি হিসেবে আপনার মাসিক বেতন স্থায়ীভাবে ${pct}% বৃদ্ধি পেয়েছে।`;
    impact = `মাসিক বেতন স্থায়ীভাবে +${pct}% বৃদ্ধি`;
  } else if (evt.templateId === 'life_promotion') {
    const bonus = evt.choices[0]?.amount ?? 0;
    const raise = evt.choices[0]?.secondaryAmount ?? 0;
    description = `আপনি সিনিয়র পদে পদোন্নতি পেয়েছেন—মাসিক বেতন +${formatCurrency(raise)} বৃদ্ধি এবং নগদ ${formatCurrency(bonus)} বোনাস!`;
    impact = `+${formatCurrency(raise)}/মাস বেতন বৃদ্ধি ও তাৎক্ষণিক +${formatCurrency(bonus)} বোনাস`;
  } else if (evt.templateId === 'life_salary_cut') {
    const pct = Math.abs(Math.round(((evt.choices[0]?.secondaryAmount ?? 0.93) - 1) * 100));
    description = `অর্থনৈতিক মন্দার কারণে ওভারটাইম ও ভাতা কমে যাওয়ায় মাসিক বেতন ${pct}% হ্রাস পেয়েছে।`;
    impact = `মাসিক বেতন -${pct}% সমন্বয়`;
  } else if (evt.templateId === 'life_market_crash') {
    const dropPct = Math.round((1 - (evt.choices[0]?.secondaryAmount ?? 0.75)) * 100);
    description = `অপ্রত্যাশিত কালো রাজহাঁস ধসে শেয়ার ও ক্রিপ্টো বাজারে বড় পতন ঘটেছে (-${dropPct}%), তবে সোনার দাম দ্রুত বেড়েছে।`;
    impact = `শেয়ার ও ক্রিপ্টো ধস (-${dropPct}%) · সোনা ধারীরা লাভে`;
  } else if (evt.templateId === 'life_property_boom') {
    const boomPct = Math.round(((evt.choices[0]?.secondaryAmount ?? 1.12) - 1) * 100);
    description = `নতুন আঞ্চলিক রেল প্রকল্পের ফলে শহরজুড়ে সব প্রপার্টির বাজারমূল্য +${boomPct}% বৃদ্ধি পেয়েছে।`;
    impact = `আপনার মালিকানাধীন সব প্রপার্টির মূল্য +${boomPct}% বাড়বে`;
  } else if (evt.templateId === 'life_new_baby') {
    const birthCost = evt.choices[0]?.amount ?? 700;
    const care = evt.choices[0]?.secondaryAmount ?? 220;
    description = `আপনার পরিবারে নতুন সন্তান এসেছে! প্রাথমিক খরচ ${formatCurrency(birthCost)} এবং মাসিক লালন-পালন ব্যয় +${formatCurrency(care)} যুক্ত হবে।`;
    impact = `+১৪ সুখ · -${formatCurrency(birthCost)} প্রাথমিক · +${formatCurrency(care)}/মাস খরচ`;
  } else if (evt.templateId === 'life_divorce') {
    const fee = evt.choices[0]?.amount ?? 1500;
    description = `বিবাহ বিচ্ছেদের কারণে ${formatCurrency(fee)} মীমাংসা খরচ দিতে হবে এবং সুখ কমে যাবে।`;
    impact = `তালাকপ্রাপ্ত অবস্থা · -${formatCurrency(fee)} খরচ · -১৫ সুখ`;
  }

  return {
    ...evt,
    title,
    description,
    financialImpactSummary: impact,
    choices: evt.choices.map((c) => localizeEventChoice(c, evt.templateId, lang)),
    resolutionNote: localizeResolutionNote(evt.resolutionNote, evt, lang),
  };
}

export function localizeTransactionText(text: string, lang: LanguageCode): string {
  if (lang !== 'bn') return text;

  if (text === 'Monthly Salary Credited') return 'মাসিক বেতন জমা হয়েছে';
  if (text === 'Stock Market Dividends Credited') return 'শেয়ার বাজারের লভ্যাংশ মূল অ্যাকাউন্টে জমা';
  if (text === 'Gold Investment Dividends Credited') return 'সোনা বিনিয়োগের লভ্যাংশ মূল অ্যাকাউন্টে জমা';
  if (text === 'Crypto Staking & Yield Dividends Credited') return 'ক্রিপ্টো বিনিয়োগের লভ্যাংশ মূল অ্যাকাউন্টে জমা';
  if (text === 'Bond Monthly Interest Credited') return 'বন্ডের মাসিক সুদ মূল অ্যাকাউন্টে জমা';
  if (text === 'Savings Monthly Interest Credited') return 'সঞ্চয়ের মাসিক সুদ মূল অ্যাকাউন্টে জমা';
  if (text === 'Property Rental Income Credited') return 'প্রপার্টি ভাড়া আয় মূল অ্যাকাউন্টে জমা';
  if (text === 'Automated Business Passive Income') return 'স্বয়ংক্রিয় ব্যবসার প্যাসিভ আয় জমা';
  if (text === 'Royalties & Other Passive Income Credited') return 'রয়্যালটি ও অন্যান্য প্যাসিভ আয় মূল অ্যাকাউন্টে জমা';
  if (text === 'Active Business Revenue') return 'সক্রিয় ব্যবসার আয়';
  if (text === 'Savings & Bond Monthly Interest') return 'সঞ্চয় ও বন্ডের মাসিক সুদ';
  if (text === 'Matured Bond Principal Returned') return 'মেয়াদোত্তীর্ণ বন্ডের আসল মূল অ্যাকাউন্টে ফেরত';
  if (text === 'Matured Bond Principal & Interest Returned') return 'মেয়াদোত্তীর্ণ বন্ডের আসল ও সুদ ফেরত';
  if (text === 'Monthly Housing, Food, Utilities & Living Costs') return 'মাসিক বাসস্থান, খাদ্য, বিদ্যুৎ ও জীবনযাত্রার খরচ';
  if (text === 'Monthly Business Operating Expenses') return 'মাসিক ব্যবসা পরিচালনা ব্যয়';
  if (text === 'Monthly Property Maintenance & Taxes') return 'মাসিক প্রপার্টি রক্ষণাবেক্ষণ ও কর';
  if (text === 'Scheduled Monthly Debt & Mortgage Installments') return 'নিয়মিত মাসিক ঋণ ও মর্টগেজ কিস্তি';

  if (text.startsWith('Started career as ')) {
    const profMatch = PROFESSIONS.find((p) => text.includes(`as ${p.name} with`));
    const bnProf = profMatch ? getT('bn').professionNames[profMatch.id]?.name ?? profMatch.name : '';
    const amt = text.match(/\$[\d,.]+/)?.[0] ?? '';
    return `${bnProf} পেশায় ${amt} প্রারম্ভিক নগদ নিয়ে যাত্রা শুরু`;
  }

  if (text.startsWith('Rental (')) {
    const nums = text.match(/\$[\d,.]+/g) ?? ['$0', '$0', '$0'];
    return `ভাড়া (${nums[0] ?? '$0'}), ডিভিডেন্ড (${nums[1] ?? '$0'}), স্বয়ংক্রিয় ব্যবসা (${nums[2] ?? '$0'})`;
  }

  if (text.startsWith('Bought ') && text.includes(' sh ')) {
    const m = text.match(/Bought (\d+) sh (\w+) @ (\$[\d,.]+)/);
    if (m) {
      const bnSym = STOCK_BN[m[2]]?.symbol ?? m[2];
      return `${m[1]}টি ${bnSym} শেয়ার কেনা হয়েছে @ ${m[3]}`;
    }
  }
  if (text.startsWith('Sold ') && text.includes(' sh ')) {
    const m = text.match(/Sold (\d+) sh (\w+) @ (\$[\d,.]+) \(P&L ([+-]?\$[\d,.]+)\)/);
    if (m) {
      const bnSym = STOCK_BN[m[2]]?.symbol ?? m[2];
      return `${m[1]}টি ${bnSym} শেয়ার বিক্রি @ ${m[3]} (লাভ-ক্ষতি ${m[4]})`;
    }
  }

  if (text.startsWith('Bought ') && text.includes(' @ ')) {
    const m = text.match(/Bought ([\d.]+) (\w+) @ (\$[\d,.]+)/);
    if (m) {
      const bnSym = CRYPTO_BN[m[2]]?.symbol ?? m[2];
      return `${m[1]} ${bnSym} কেনা হয়েছে @ ${m[3]}`;
    }
  }
  if (text.startsWith('Sold ') && text.includes(' @ ')) {
    const m = text.match(/Sold ([\d.]+) (\w+) @ (\$[\d,.]+)/);
    if (m) {
      const bnSym = CRYPTO_BN[m[2]]?.symbol ?? m[2];
      return `${m[1]} ${bnSym} বিক্রি @ ${m[3]}`;
    }
  }

  if (text.startsWith('Deposited ')) {
    const m = text.match(/Deposited (\$[\d,.]+) into (.+)/);
    if (m) {
      const prod = FIXED_INCOME_PRODUCTS.find((p) => p.name === m[2]);
      const bnName = prod && FIXED_BN[prod.id] ? FIXED_BN[prod.id].name : m[2];
      return `${bnName}-এ ${m[1]} জমা করা হয়েছে`;
    }
  }
  if (text.startsWith('Redeemed ')) {
    const amt = text.match(/-\$[\d,]+/)?.[0];
    const prod = FIXED_INCOME_PRODUCTS.find((p) => text.includes(p.name));
    const bnName = prod && FIXED_BN[prod.id] ? FIXED_BN[prod.id].name : 'বন্ড ও সঞ্চয়';
    return amt
      ? `${bnName} ভাঙানো হয়েছে (${amt} আগাম ফি)`
      : `${bnName} থেকে টাকা তোলা হয়েছে`;
  }

  if (text.startsWith('Acquired ')) {
    const propKey = Object.keys(PROPERTY_BN).find((k) => text.includes(k));
    if (propKey) {
      const bnName = PROPERTY_BN[propKey].name;
      const isCash = text.includes('All-cash');
      const down = text.match(/\$[\d,]+/)?.[0] ?? '';
      return isCash
        ? `সম্পূর্ণ নগদে কেনা হয়েছে: ${bnName}`
        : `মর্টগেজসহ কেনা হয়েছে: ${bnName} (${down} ডাউন)`;
    }
    const bizKey = Object.keys(BUSINESS_BN).find((k) => text.includes(k));
    if (bizKey) return `ব্যবসা অধিগ্রহণ: ${BUSINESS_BN[bizKey].name}`;
    return text.replace('Acquired ', 'অধিগ্রহণ: ');
  }

  if (text.startsWith('Launched ')) {
    const bizKey = Object.keys(BUSINESS_BN).find((k) => text.includes(k));
    if (bizKey) return `নতুন ব্যবসা শুরু: ${BUSINESS_BN[bizKey].name}`;
    return text.replace('Launched ', 'শুরু হয়েছে: ');
  }

  if (text.startsWith('Automated ')) {
    const bizKey = Object.keys(BUSINESS_BN).find((k) => text.includes(k));
    const name = bizKey ? BUSINESS_BN[bizKey].name : text.replace('Automated ', '').replace(' (Manager & Systems Setup)', '');
    return `স্বয়ংক্রিয় করা হয়েছে: ${name}`;
  }

  if (text.startsWith('Sold ')) {
    const propKey = Object.keys(PROPERTY_BN).find((k) => text.includes(k));
    if (propKey) {
      const amts = text.match(/\$[\d,]+/g) ?? [];
      return `বিক্রি হয়েছে: ${PROPERTY_BN[propKey].name} (${amts[0] ?? ''})`;
    }
    const bizKey = Object.keys(BUSINESS_BN).find((k) => text.includes(k));
    if (bizKey) {
      const amts = text.match(/\$[\d,]+/g) ?? [];
      return `ব্যবসা বিক্রি: ${BUSINESS_BN[bizKey].name} (${amts[0] ?? ''})`;
    }
  }

  if (text.startsWith('Issued ')) {
    const amts = text.match(/\$[\d,]+/g) ?? [];
    const pct = text.match(/[\d.]+%/)?.[0] ?? '';
    return `নতুন ঋণ গৃহীত (${amts[0] ?? ''} @ ${pct} বার্ষিক সুদ)`;
  }
  if (text.startsWith('Paid off ') || text.startsWith('Extra payment on ')) {
    const paid = text.startsWith('Paid off ');
    return paid ? 'ঋণ সম্পূর্ণ পরিশোধ হয়েছে' : 'ঋণের অতিরিক্ত কিস্তি পরিশোধ';
  }
  if (text.startsWith('Automatic Credit Facility Draw')) {
    const amt = text.match(/\$[\d,]+/)?.[0] ?? '';
    return `স্বয়ংক্রিয় জরুরি ক্রেডিট গ্রহণ (${amt} @ ১৮% বার্ষিক সুদ)`;
  }

  if (text === 'Monthly Insurance Premiums') return 'মাসিক বীমা প্রিমিয়াম';
  if (text.startsWith('Enrolled in ')) {
    const plan = INSURANCE_PLANS.find((p) => text.includes(p.nameEn));
    return plan ? `${getInsurancePlanName(plan, 'bn')} বীমা চালু হয়েছে` : 'বীমা চালু হয়েছে';
  }
  if (text.startsWith('Wedding Ceremony')) {
    return 'বিবাহ অনুষ্ঠান (+১৮ সুখ)';
  }
  if (text === 'New Baby Arrival Care') {
    return 'নবজাতক সন্তানের আগমন ও যত্ন';
  }
  if (text === 'Divorce Legal Settlement') {
    return 'বিবাহ বিচ্ছেদ আইনি মীমাংসা';
  }
  for (const hItem of ALL_HAPPINESS_ITEMS) {
    if (text.startsWith(`${hItem.nameEn} (+`)) {
      const gain = text.match(/\(\+(\d+)\s+Happiness\)/)?.[1] ?? hItem.happinessGain;
      return `${getHappinessItemName(hItem, 'bn')} (+${gain} সুখ)`;
    }
  }
  for (const pItem of PERSONAL_ASSETS) {
    if (text === `Bought ${pItem.nameEn}`) {
      return `কেনা হয়েছে: ${getPersonalAssetName(pItem, 'bn')}`;
    }
    if (text === `Insured ${pItem.nameEn}`) {
      return `বীমা সক্রিয় হয়েছে: ${getPersonalAssetName(pItem, 'bn')}`;
    }
    if (text === `Uninsured Accident (${pItem.nameEn})`) {
      return `বীমাহীন দুর্ঘটনা (${getPersonalAssetName(pItem, 'bn')})`;
    }
  }
  if (
    text.startsWith('Lottery Jackpot: ') ||
    text.startsWith('Lottery Win: ') ||
    text.startsWith('Lottery Ticket: ')
  ) {
    const matched = LOTTERY_TICKETS.find((t) => text.endsWith(t.nameEn));
    const bnName = matched ? getLotteryTicketName(matched, 'bn') : 'ভাগ্য লটারি';
    if (text.startsWith('Lottery Jackpot: ')) return `লটারি জ্যাকপট জয়: ${bnName}`;
    if (text.startsWith('Lottery Win: ')) return `লটারি পুরস্কার জয়: ${bnName}`;
    return `লটারি টিকিট কেনা: ${bnName}`;
  }
  if (text.startsWith('Venture Profit: ') || text.startsWith('Venture Loss: ')) {
    const isProfit = text.startsWith('Venture Profit: ');
    const enTitle = text.slice(isProfit ? 'Venture Profit: '.length : 'Venture Loss: '.length);
    const allVentures = Object.values(CHARACTER_VENTURES).flat();
    const matched = allVentures.find((v) => v.titleEn === enTitle);
    const bnTitle = matched ? matched.titleBn : enTitle;
    return isProfit ? `বিশেষ সুযোগ থেকে লাভ: ${bnTitle}` : `বিশেষ সুযোগে সম্পূর্ণ ক্ষতি: ${bnTitle}`;
  }

  if (
    text.startsWith('Paid Year-End Islamic Zakat') ||
    text.startsWith('Paid Accrued Islamic Zakat') ||
    text.startsWith('Paid Year-End Income Tax') ||
    text.startsWith('Paid Accrued Income Tax')
  ) {
    const amt = text.match(/\$[\d,.]+/)?.[0] ?? '';
    if (text.startsWith('Paid Year-End Islamic Zakat')) {
      return `বছর শেষের ইসলামী জাকাত পরিশোধ (${amt})`;
    }
    if (text.startsWith('Paid Accrued Islamic Zakat')) {
      return `অগ্রিম ইসলামী জাকাত পরিশোধ (${amt})`;
    }
    if (text.startsWith('Paid Year-End Income Tax')) {
      return `বছর শেষের আয়কর পরিশোধ (${amt})`;
    }
    return `অগ্রিম আয়কর পরিশোধ (${amt})`;
  }

  if (text.startsWith('Opportunity Investment: ')) {
    const m = text.match(/Opportunity Investment: (\d+) (\w+) @ (\$[\d,.]+)/);
    if (m) {
      const bnSym = STOCK_BN[m[2]]?.symbol ?? m[2];
      return `সুযোগ বিনিয়োগ: ${m[1]}টি ${bnSym} @ ${m[3]} (ফলাফল মাস শেষে)`;
    }
    const rawTitle = text.slice('Opportunity Investment: '.length);
    const matchedTpl = EVENT_POOL.find((tpl) => tpl.title === rawTitle);
    const matchedSig = Object.values(CHARACTER_SIGNATURE_OPPORTUNITIES).find(
      (s) => s.titleEn === rawTitle
    );
    const bnTitle =
      matchedTpl && EVENT_BN[matchedTpl.id]
        ? EVENT_BN[matchedTpl.id].title
        : matchedSig?.titleBn ?? rawTitle;
    return `সুযোগ বিনিয়োগ: ${bnTitle}`;
  }
  if (text.startsWith('Opportunity Settled: ')) {
    const amt = text.match(/\$[\d,.]+/)?.[0] ?? '';
    return `সুযোগ বিনিয়োগ নিষ্পত্তি (${amt})`;
  }
  if (text.startsWith('Venture Settled: ')) {
    const amt = text.match(/\+?\$[\d,.]+/)?.[0] ?? '';
    const titlePart = text
      .slice('Venture Settled: '.length)
      .replace(/\s*\(\+?\$[\d,.]+\)\s*$/, '')
      .trim();
    const matchedTpl = EVENT_POOL.find((tpl) => tpl.title === titlePart);
    const matchedSig = Object.values(CHARACTER_SIGNATURE_OPPORTUNITIES).find(
      (s) => s.titleEn === titlePart
    );
    const bnTitle =
      matchedTpl && EVENT_BN[matchedTpl.id]
        ? EVENT_BN[matchedTpl.id].title
        : matchedSig?.titleBn ?? titlePart;
    return amt ? `সুযোগ থেকে আয়: ${bnTitle} (${amt})` : `সুযোগ থেকে আয়: ${bnTitle}`;
  }
  if (text.startsWith('Conference Travel Expense: ')) {
    const rawTitle = text.slice('Conference Travel Expense: '.length).trim();
    const matchedTpl = EVENT_POOL.find((tpl) => tpl.title === rawTitle);
    const bnTitle = matchedTpl && EVENT_BN[matchedTpl.id] ? EVENT_BN[matchedTpl.id].title : rawTitle;
    return `ভ্রমণ খরচ: ${bnTitle}`;
  }

  // Fallback for Event logs containing English template title
  for (const tpl of EVENT_POOL) {
    if (text.includes(tpl.title) && EVENT_BN[tpl.id]) {
      const amt = text.match(/[+-]?\$[\d,]+/)?.[0] ?? '';
      return amt ? `${EVENT_BN[tpl.id].title} (${amt})` : EVENT_BN[tpl.id].title;
    }
  }

  return text;
}

export function localizeTurnNote(note: string, lang: LanguageCode): string {
  if (lang !== 'bn') return note;
  if (note.startsWith('Opportunity Settled (')) {
    const amts = note.match(/\$[\d,.]+/g) ?? [];
    const pct = note.match(/[+-]?\d+%/)?.[0] ?? '';
    return `সুযোগ বিনিয়োগ নিষ্পত্তি হয়েছে — পরিশোধ ${amts[0] ?? ''} (${pct})`;
  }
  if (note.includes('matured —')) {
    const amt = note.match(/\$[\d,.]+/)?.[0] ?? '';
    const prod = FIXED_INCOME_PRODUCTS.find((p) => note.includes(p.name));
    const bnName = prod && FIXED_BN[prod.id] ? FIXED_BN[prod.id].name : 'বন্ড';
    return `${bnName}-এর মেয়াদ পূর্ণ হয়েছে — মূল অ্যাকাউন্টে ${amt} ফেরত এসেছে।`;
  }
  if (note.startsWith('Loan completely paid off:')) {
    return 'একটি ঋণ সম্পূর্ণ পরিশোধ হয়ে গেছে!';
  }
  if (note.startsWith('Cash fell short by ')) {
    const amts = note.match(/\$[\d,]+/g) ?? [];
    return `নগদ ${amts[0] ?? ''} ঘাটতি হওয়ায় ${amts[1] ?? ''} জরুরি ক্রেডিট লাইন ব্যবহার হয়েছে।`;
  }
  if (note.startsWith('Black Swan Crash')) {
    const dropPct = note.match(/-\d+%/)?.[0] ?? '';
    const surgePct = note.match(/\+\d+%/)?.[0] ?? '';
    const gain = note.match(/\+\$[\d,.]+/)?.[0];
    const bracketed = note.match(/\[([^\]]+)\]/)?.[1];
    const matchedStock = bracketed
      ? STOCK_CATALOG.find((s) => s.name === bracketed)
      : undefined;
    const bnWinner =
      !bracketed || bracketed === 'Gold'
        ? 'সোনা'
        : matchedStock
          ? STOCK_BN[matchedStock.symbol]?.symbol ?? bracketed
          : bracketed;
    return gain
      ? `কালো রাজহাঁস বাজার ধস (${dropPct}): ${bnWinner} ${surgePct} বেড়ে আপনার ${gain} লাভ হয়েছে!`
      : `কালো রাজহাঁস বাজার ধস (${dropPct}): বাজার পড়েছে, তবে ${bnWinner} ${surgePct} বেড়ে ধারীদের লাভ এনেছে!`;
  }
  if (note.startsWith('Annual Inflation (0%)')) {
    return 'বার্ষিক মুদ্রাস্ফীতি (০%): এ বছর পণ্যের দাম স্থিতিশীল রয়েছে।';
  }
  if (note.startsWith('Annual Inflation')) {
    const pct = note.match(/\+\d+%/)?.[0] ?? '';
    return `বার্ষিক মুদ্রাস্ফীতি (${pct}): জীবনযাত্রার ব্যয় ও পণ্যের দাম বেড়েছে।`;
  }
  if (note.startsWith('New Baby Born!')) {
    const amt = note.match(/\+\$[\d,]+/)?.[0] ?? '';
    return `নতুন সন্তানের জন্ম হয়েছে! মাসিক লালন-পালন খরচ ${amt}/মাস বেড়েছে।`;
  }
  if (note.startsWith('Divorce occurred:')) {
    const amt = note.match(/\$[\d,]+/)?.[0];
    return amt
      ? `বিবাহ বিচ্ছেদ ঘটেছে: মীমাংসায় ${amt} পরিশোধ হয়েছে।`
      : 'বিবাহ বিচ্ছেদ ঘটেছে: বৈবাহিক অবস্থা তালাকপ্রাপ্ত হয়েছে।';
  }
  if (note.startsWith('Yearly Happiness Penalty')) {
    const pen = note.match(/\(-\d+\)/)?.[0] ?? '';
    return `নিজস্ব বাড়ি, গাড়ি বা ইয়ট না থাকায় বার্ষিক সুখ কর্তন হয়েছে ${pen}।`;
  }
  if (note.startsWith('Uninsured Accident (')) {
    const matched = PERSONAL_ASSETS.find((p) => note.includes(`(${p.nameEn})`));
    const bnAsset = matched ? getPersonalAssetName(matched, 'bn') : 'সম্পদ';
    const cashStr = note.match(/-\$[\d,]+/)?.[0] ?? '';
    const hapNum = note.match(/-(\d+)\s+Happiness/)?.[1] ?? '';
    return `${bnAsset}-এর বীমা না থাকায় দুর্ঘটনায় মূল ব্যালেন্স থেকে ${cashStr} এবং ${hapNum} সুখ বিয়োগ হয়েছে!`;
  }
  if (note.startsWith('Year-End Islamic Zakat due:')) {
    const amt = note.match(/\$[\d,.]+/)?.[0] ?? '';
    return `বছর শেষে ইসলামী বিধান অনুযায়ী ২.৫% জাকাত নির্ধারিত হয়েছে: ${amt}।`;
  }
  if (note.startsWith('Year-End Income Tax assessed:')) {
    const amt = note.match(/\$[\d,.]+/)?.[0] ?? '';
    return `বছর শেষের বার্ষিক আয়কর নির্ধারিত হয়েছে: ${amt}।`;
  }
  return localizeTransactionText(note, lang);
}

export function localizeTransactionDate(tx: TransactionRecord, lang: LanguageCode): string {
  if (lang !== 'bn') return tx.dateLabel;
  const MONTHS_BN = [
    'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে',
  ];
  return `ব${tx.year} ${MONTHS_BN[(tx.month - 1) % 12] ?? 'জানু'}`;
}
