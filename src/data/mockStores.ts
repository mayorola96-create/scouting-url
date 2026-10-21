import { StoreItem } from '../utils/engine';

export const INITIAL_STORES: StoreItem[] = [
  {
    id: 'store_1',
    rawUrl: 'nordicwear-studio.com',
    cleanUrl: 'https://nordicwear-studio.com/pages/contact',
    domain: 'nordicwear-studio.com',
    storeName: 'Nordicwear Studio',
    status: 'pending',
  },
  {
    id: 'store_2',
    rawUrl: 'aurora-organics.shop',
    cleanUrl: 'https://aurora-organics.shop',
    domain: 'aurora-organics.shop',
    storeName: 'Aurora Organics',
    status: 'pending',
  },
  {
    id: 'store_3',
    rawUrl: 'veldt-coffee-roasters.com',
    cleanUrl: 'https://veldt-coffee-roasters.com/pages/contact',
    domain: 'veldt-coffee-roasters.com',
    storeName: 'Veldt Coffee Roasters',
    status: 'pending',
  },
  {
    id: 'store_4',
    rawUrl: 'lumin-home-decor.com',
    cleanUrl: 'https://lumin-home-decor.com',
    domain: 'lumin-home-decor.com',
    storeName: 'Lumin Home Decor',
    status: 'pending',
  },
  {
    id: 'store_5',
    rawUrl: 'apex-fitness-gear.myshopify.com',
    cleanUrl: 'https://apex-fitness-gear.myshopify.com/pages/contact',
    domain: 'apex-fitness-gear.myshopify.com',
    storeName: 'Apex Fitness Gear',
    status: 'pending',
  },
];

export const TEMPLATE_PRESETS = [
  {
    name: 'Wholesale & Retail Pitch',
    subject: 'Wholesale & Distribution inquiry for {store_name}',
    message: `Hi {store_name} Team,

I came across {domain} and love your product line! We run a premier lifestyle distribution network with over 45 retail partner doors.

We are looking to place a bulk opening order for our upcoming seasonal catalog and would love to review your wholesale line sheet and minimum order quantities.

Could you please point me to your wholesale buyer or partnerships lead?

Warm regards,
{full_name}
{email}
{phone}`,
  },
  {
    name: 'Creator / Brand Collaboration',
    subject: 'Partnership / Collaboration with {store_name}',
    message: `Hello {store_name} Team,

I've been a huge fan of {domain} and your aesthetic! We are planning a series of high-engagement creator showcases and think {store_name}'s collection would be a perfect feature for our audience.

Would love to share our media kit and discuss a potential co-branded campaign or product gifting.

Who is the best person on your PR/influencer team to speak with?

Best,
{full_name}
{email}`,
  },
  {
    name: 'Supplier / Manufacturing Inquiry',
    subject: 'Supply chain & custom manufacturing proposal for {store_name}',
    message: `Hi {store_name} Team,

We noticed the exceptional growth and craft of {domain}. We are an ISO-certified supply chain partner specializing in rapid domestic replenishment and premium eco-friendly packaging for high-growth brands.

Could we schedule a 10-minute discovery call with your operations or merchandising director?

Best regards,
{full_name}
{email}
{phone}`,
  },
];
