/**
 * Copy for the footer's information pages. The client can edit these strings
 * without touching component code.
 *
 * NEEDS CLIENT CONFIRMATION: the policy pages (privacy, cookies, terms,
 * acceptable use) and the shipping pages are starter text, not legal advice.
 * Have them reviewed before launch.
 */

export type InfoSection = { heading: string; paragraphs: string[] };
export type InfoPageContent = { title: string; intro?: string; sections: InfoSection[] };

export const ABOUT: InfoPageContent = {
  title: "About us",
  intro:
    "Tools Solutions supplies genuine industrial tools to workshops, contractors and factories across India.",
  sections: [
    {
      heading: "What we sell",
      paragraphs: [
        "Cutting and drilling tools, power tools, measuring instruments, safety gear and clamping tools, sourced from authorised suppliers.",
      ],
    },
    {
      heading: "How we work",
      paragraphs: [
        "Every product is checked before dispatch, and our team can help you choose the right tool for the job.",
        "We ship fast within India and offer special pricing on bulk orders.",
      ],
    },
  ],
};

export const REVIEWS: InfoPageContent = {
  title: "Customer reviews",
  intro: "Our customers rate us 4.8 out of 5.",
  sections: [
    {
      heading: "Read reviews",
      paragraphs: [
        "Every product page shows reviews from customers who bought that tool. Open any product to read them.",
      ],
    },
    {
      heading: "Write a review",
      paragraphs: [
        "Log in, open a product you bought and use the review form at the bottom of the page.",
      ],
    },
  ],
};

export const PRIVACY: InfoPageContent = {
  title: "Privacy policy",
  intro: "This page explains what personal information we collect and how we use it.",
  sections: [
    {
      heading: "What we collect",
      paragraphs: [
        "Your name, email address, delivery addresses and order history when you create an account or place an order.",
      ],
    },
    {
      heading: "How we use it",
      paragraphs: [
        "To process and deliver your orders, send order updates and answer your questions. We do not sell your personal information.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can update your name and addresses from your account at any time. Contact us to ask for a copy of your data or to delete your account.",
      ],
    },
  ],
};

export const COOKIES: InfoPageContent = {
  title: "Cookie policy",
  intro: "We use a small number of cookies to keep the store working.",
  sections: [
    {
      heading: "Essential cookies",
      paragraphs: [
        "A session cookie keeps you logged in. Your cart is stored in your browser so it is still there when you come back.",
      ],
    },
    {
      heading: "Managing cookies",
      paragraphs: [
        "You can clear or block cookies in your browser settings. If you block essential cookies, you will not be able to log in.",
      ],
    },
  ],
};

export const TERMS: InfoPageContent = {
  title: "Terms & conditions",
  intro: "By using this store and placing an order, you agree to these terms.",
  sections: [
    {
      heading: "Orders and prices",
      paragraphs: [
        "All prices are in Indian rupees. We may cancel an order if a product is out of stock or a price was shown in error, and we will refund any payment in full.",
      ],
    },
    {
      heading: "Delivery",
      paragraphs: ["Delivery times shown on the site are estimates. See our delivery pages for details."],
    },
    {
      heading: "Returns",
      paragraphs: [
        "If a product arrives damaged or is not what you ordered, contact us within 7 days of delivery.",
      ],
    },
  ],
};

export const ACCEPTABLE_USE: InfoPageContent = {
  title: "Acceptable use policy",
  intro: "Please use this store fairly and lawfully.",
  sections: [
    {
      heading: "You must not",
      paragraphs: [
        "Use the site for fraud, post false or offensive reviews, try to access other people's accounts, or interfere with how the site works.",
      ],
    },
    {
      heading: "What we may do",
      paragraphs: ["We may remove content or suspend accounts that break this policy."],
    },
  ],
};

export const SITEMAP: InfoPageContent = {
  title: "Sitemap",
  intro: "Every page on Tools Solutions in one place.",
  sections: [],
};

export const SHIP_A_PACKAGE: InfoPageContent = {
  title: "Ship a package",
  intro: "Every order is packed and shipped by our team. There is nothing you need to arrange.",
  sections: [
    {
      heading: "How it works",
      paragraphs: [
        "Add tools to your cart and check out. We pack your order securely and hand it to our delivery partner, usually on the same day.",
      ],
    },
  ],
};

export const DOMESTIC: InfoPageContent = {
  title: "Domestic shipping",
  intro: "We deliver across India.",
  sections: [
    {
      heading: "Delivery times",
      paragraphs: [
        "Most orders arrive in 1 to 3 days. The estimate for your address is shown in the cart and at checkout.",
      ],
    },
    {
      heading: "Shipping charges",
      paragraphs: ["Shipping charges, if any, are shown at checkout before you pay."],
    },
  ],
};

export const INTERNATIONAL: InfoPageContent = {
  title: "International shipping",
  intro: "We currently deliver within India only.",
  sections: [
    {
      heading: "Ordering from outside India",
      paragraphs: ["For export enquiries, contact our team and we will tell you what is possible."],
    },
  ],
};

export const BULK: InfoPageContent = {
  title: "Bulk shipping",
  intro: "Buying for a workshop, site or factory? We offer special pricing and delivery on bulk orders.",
  sections: [
    {
      heading: "Get a quote",
      paragraphs: [
        "Send us the products and quantities you need on WhatsApp or by phone, and we will reply with a quote and a delivery date.",
      ],
    },
  ],
};

export const COURIERS: InfoPageContent = {
  title: "Couriers",
  intro: "We work with trusted courier partners to deliver your tools safely.",
  sections: [
    {
      heading: "Tracking",
      paragraphs: [
        "Once your order ships, you can follow it from My orders. You will also get updates in your notifications.",
      ],
    },
  ],
};

export const DELIVERY: InfoPageContent = {
  title: "Delivery services",
  intro: "Fast, careful delivery for every order.",
  sections: [
    {
      heading: "Fast delivery",
      paragraphs: ["Many products can reach you in 1 day. Look for the delivery label on the product page."],
    },
    {
      heading: "Secure packing",
      paragraphs: ["Tools are packed to arrive undamaged. If something arrives damaged, contact us within 7 days."],
    },
  ],
};

export const CONTACT: InfoPageContent = {
  title: "Contact us",
  intro: "Questions about a tool, an order or a bulk quote? We are happy to help.",
  sections: [],
};

export const SUPPORT: InfoPageContent = {
  title: "Support hub",
  intro: "Find help with orders, delivery and your account.",
  sections: [
    {
      heading: "Orders",
      paragraphs: ["See the status of every order in My orders. Log in first to view them."],
    },
    {
      heading: "Delivery",
      paragraphs: ["Read about delivery times and charges on our domestic shipping page."],
    },
    {
      heading: "Still need help?",
      paragraphs: ["Contact us by phone or WhatsApp and our team will get back to you."],
    },
  ],
};
