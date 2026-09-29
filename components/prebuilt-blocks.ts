import { BlockManager, ElementType } from "easy-email-pro-core";
import type { Element } from "easy-email-pro-core";
import type { PrebuiltBlockCategory } from "easy-email-pro-theme";

// Builds an element with the library's own defaults, overridden by `payload`
const create = (type: Element["type"], payload: Record<string, unknown> = {}) =>
  BlockManager.getBlockByType(type).create(payload) as Element;

const text = (type: Element["type"], value: string, attributes = {}) =>
  create(type, { attributes, children: [{ text: value }] });

const column = (children: Element[], attributes = {}) =>
  create(ElementType.STANDARD_COLUMN, { attributes, children });

const section = (children: Element[], attributes = {}) =>
  create(ElementType.STANDARD_SECTION, { attributes, children });

const image = (src: string, attributes = {}) =>
  create(ElementType.STANDARD_IMAGE, { attributes: { src, ...attributes } });

const button = (label: string, attributes = {}) =>
  create(ElementType.STANDARD_BUTTON, {
    attributes: { href: "#", ...attributes },
    children: [{ text: label }],
  });

// Wireframe thumbnail: a 300x160 SVG drawn from the given shapes
const thumbnail = (shapes: string, background = "#ffffff") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160"><rect width="300" height="160" fill="${background}"/>${shapes}</svg>`,
  )}`;
const bar = (x: number, y: number, w: number, h: number, fill = "#d4d7dc", r = 3) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

type Block = PrebuiltBlockCategory["blocks"][number];
type Payload = Block["payload"];

const spacer = (height: string) =>
  create(ElementType.STANDARD_SPACER, { attributes: { height } });

const divider = () =>
  create(ElementType.STANDARD_DIVIDER, {
    attributes: {
      "border-width": "1px",
      "border-style": "solid",
      "border-color": "#e5e7eb",
      "padding-top": "10px",
      "padding-bottom": "10px",
    },
  });

const productColumn = (name: string, price: string, width?: string) =>
  column(
    [
      image(`https://placehold.co/400x400?text=${encodeURIComponent(name)}`),
      text(ElementType.STANDARD_H3, name, { align: "center" }),
      text(ElementType.STANDARD_PARAGRAPH, price, {
        align: "center",
        color: "#4f46e5",
      }),
      button("Buy now", { "background-color": "#111827" }),
    ],
    width ? { width } : {},
  );

const baseBlocks: PrebuiltBlockCategory[] = [
  {
    get label() {
      return "Headers";
    },
    active: true,
    blocks: [
      {
        title: "Logo + menu",
        category: "Headers",
        thumbnail: thumbnail(
          bar(110, 30, 80, 30, "#9aa3ad") +
            bar(55, 95, 40, 10) +
            bar(105, 95, 40, 10) +
            bar(155, 95, 40, 10) +
            bar(205, 95, 40, 10),
        ),
        payload: section(
          [
            column([
              image("https://placehold.co/300x100?text=Your+Logo", {
                width: "150px",
                align: "center",
              }),
              create(ElementType.STANDARD_NAVBAR),
            ]),
          ],
          { "padding-top": "20px", "padding-bottom": "10px" },
        ) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
    ],
  },
  {
    get label() {
      return "Hero";
    },
    active: true,
    blocks: [
      {
        title: "Hero banner",
        category: "Hero",
        thumbnail: thumbnail(
          bar(60, 35, 180, 18, "#ffffff") +
            bar(80, 65, 140, 8, "#c7d2fe") +
            bar(95, 80, 110, 8, "#c7d2fe") +
            bar(110, 105, 80, 24, "#ffffff", 12),
          "#4f46e5",
        ),
        payload: section(
          [
            column([
              text(ElementType.STANDARD_H1, "Big news is here", {
                align: "center",
                color: "#ffffff",
              }),
              text(
                ElementType.STANDARD_PARAGRAPH,
                "Tell your readers what's new in one or two short sentences.",
                { align: "center", color: "#e0e7ff" },
              ),
              button("Learn more", {
                "background-color": "#ffffff",
                color: "#4f46e5",
                "border-radius": "24px",
              }),
            ]),
          ],
          {
            "background-color": "#4f46e5",
            "padding-top": "48px",
            "padding-bottom": "48px",
          },
        ) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
    ],
  },
  {
    get label() {
      return "Content";
    },
    active: true,
    blocks: [
      {
        title: "Image left, text right",
        category: "Content",
        thumbnail: thumbnail(
          bar(20, 25, 120, 110, "#9aa3ad") +
            bar(160, 35, 110, 14, "#6b7280") +
            bar(160, 60, 120, 8) +
            bar(160, 75, 100, 8) +
            bar(160, 105, 70, 22, "#4f46e5", 11),
        ),
        payload: section([
          column(
            [image("https://placehold.co/600x400?text=Image")],
            { width: "50%" },
          ),
          column(
            [
              text(ElementType.STANDARD_H2, "Feature title"),
              text(
                ElementType.STANDARD_PARAGRAPH,
                "Describe the feature or product in a sentence or two.",
              ),
              button("Read more", { align: "left" }),
            ],
            { width: "50%" },
          ),
        ]) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
      {
        title: "Three features",
        category: "Content",
        thumbnail: thumbnail(
          [20, 115, 210]
            .map(
              (x) =>
                bar(x, 25, 70, 50, "#9aa3ad") +
                bar(x, 85, 60, 10, "#6b7280") +
                bar(x, 102, 70, 7) +
                bar(x, 114, 55, 7),
            )
            .join(""),
        ),
        payload: section(
          ["One", "Two", "Three"].map((n) =>
            column(
              [
                image(`https://placehold.co/300x200?text=${n}`),
                text(ElementType.STANDARD_H3, `Feature ${n.toLowerCase()}`, {
                  align: "center",
                }),
                text(ElementType.STANDARD_PARAGRAPH, "A short description.", {
                  align: "center",
                }),
              ],
              { width: "33.33%" },
            ),
          ),
        ) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
    ],
  },
  {
    get label() {
      return "Call to action";
    },
    active: true,
    blocks: [
      {
        title: "CTA banner",
        category: "Call to action",
        thumbnail: thumbnail(
          bar(70, 45, 160, 16, "#374151") +
            bar(90, 72, 120, 8) +
            bar(105, 100, 90, 26, "#4f46e5", 13),
          "#f3f4f6",
        ),
        payload: section(
          [
            column([
              text(ElementType.STANDARD_H2, "Ready to get started?", {
                align: "center",
              }),
              text(
                ElementType.STANDARD_PARAGRAPH,
                "Join today and get 20% off your first order.",
                { align: "center" },
              ),
              button("Get started", {
                "background-color": "#4f46e5",
                "border-radius": "24px",
              }),
            ]),
          ],
          {
            "background-color": "#f3f4f6",
            "padding-top": "40px",
            "padding-bottom": "40px",
          },
        ) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
    ],
  },
  {
    get label() {
      return "Footers";
    },
    active: true,
    blocks: [
      {
        title: "Social + address",
        category: "Footers",
        thumbnail: thumbnail(
          `<circle cx="120" cy="55" r="12" fill="#9aa3ad"/><circle cx="150" cy="55" r="12" fill="#9aa3ad"/><circle cx="180" cy="55" r="12" fill="#9aa3ad"/>` +
            bar(60, 90, 180, 8) +
            bar(90, 106, 120, 8),
        ),
        payload: section(
          [
            column([
              create(ElementType.STANDARD_SOCIAL),
              text(
                ElementType.STANDARD_PARAGRAPH,
                "Your Company · 123 Street, City · You're receiving this email because you signed up.",
                { align: "center", color: "#6b7280" },
              ),
            ]),
          ],
          { "padding-top": "20px", "padding-bottom": "20px" },
        ) as PrebuiltBlockCategory["blocks"][number]["payload"],
      },
    ],
  },
];

// Extra blocks appended to the categories above, by label
const extraBlocks: Record<string, Block[]> = {
  Headers: [
    {
      title: "Logo left, link right",
      category: "Headers",
      thumbnail: thumbnail(
        bar(20, 60, 80, 30, "#9aa3ad") + bar(190, 70, 90, 10),
      ),
      payload: section(
        [
          column(
            [
              image("https://placehold.co/300x100?text=Logo", {
                width: "120px",
                align: "left",
              }),
            ],
            { width: "50%" },
          ),
          column(
            [
              text(ElementType.STANDARD_PARAGRAPH, "View in browser", {
                align: "right",
                color: "#6b7280",
                "font-size": "12px",
              }),
            ],
            { width: "50%", "vertical-align": "middle" },
          ),
        ],
        { "padding-top": "16px", "padding-bottom": "16px" },
      ) as Payload,
    },
    {
      title: "Centered logo",
      category: "Headers",
      thumbnail: thumbnail(
        bar(110, 50, 80, 30, "#9aa3ad") + bar(30, 110, 240, 2, "#e5e7eb", 0),
      ),
      payload: section(
        [
          column([
            image("https://placehold.co/300x100?text=Logo", {
              width: "140px",
              align: "center",
            }),
            divider(),
          ]),
        ],
        { "padding-top": "20px" },
      ) as Payload,
    },
  ],
  Hero: [
    {
      title: "Image hero",
      category: "Hero",
      thumbnail: thumbnail(
        bar(0, 0, 300, 80, "#9aa3ad", 0) +
          bar(70, 92, 160, 14, "#374151") +
          bar(90, 114, 120, 7) +
          bar(115, 128, 70, 20, "#4f46e5", 10),
      ),
      payload: section([
        column([
          image("https://placehold.co/1200x600?text=Hero+image", {
            "padding-left": "0px",
            "padding-right": "0px",
          }),
          text(ElementType.STANDARD_H1, "Your headline here", {
            align: "center",
          }),
          text(
            ElementType.STANDARD_PARAGRAPH,
            "A supporting sentence that makes people want to read on.",
            { align: "center" },
          ),
          button("Shop now", {
            "background-color": "#4f46e5",
            "border-radius": "24px",
          }),
        ]),
      ]) as Payload,
    },
  ],
  Content: [
    {
      title: "Text left, image right",
      category: "Content",
      thumbnail: thumbnail(
        bar(20, 35, 110, 14, "#6b7280") +
          bar(20, 60, 120, 8) +
          bar(20, 75, 100, 8) +
          bar(20, 105, 70, 22, "#4f46e5", 11) +
          bar(160, 25, 120, 110, "#9aa3ad"),
      ),
      payload: section([
        column(
          [
            text(ElementType.STANDARD_H2, "Feature title"),
            text(
              ElementType.STANDARD_PARAGRAPH,
              "Describe the feature or product in a sentence or two.",
            ),
            button("Read more", { align: "left" }),
          ],
          { width: "50%" },
        ),
        column([image("https://placehold.co/600x400?text=Image")], {
          width: "50%",
        }),
      ]) as Payload,
    },
    {
      title: "Article",
      category: "Content",
      thumbnail: thumbnail(
        bar(20, 25, 180, 16, "#374151") +
          [55, 70, 85, 105, 120, 135]
            .map((y, i) => bar(20, y, i % 3 === 2 ? 180 : 260, 7))
            .join(""),
      ),
      payload: section([
        column([
          text(ElementType.STANDARD_H2, "Article title"),
          text(
            ElementType.STANDARD_PARAGRAPH,
            "Start with the most important point. Keep paragraphs short so they're easy to read on a phone.",
          ),
          text(
            ElementType.STANDARD_PARAGRAPH,
            "Add detail in a second paragraph, then point readers to what to do next.",
          ),
        ]),
      ]) as Payload,
    },
  ],
  "Call to action": [
    {
      title: "Two buttons",
      category: "Call to action",
      thumbnail: thumbnail(
        bar(60, 67, 80, 26, "#4f46e5", 13) +
          `<rect x="160" y="67" width="80" height="26" rx="13" fill="#ffffff" stroke="#4f46e5"/>`,
      ),
      payload: section([
        column(
          [
            button("Primary action", {
              align: "right",
              "background-color": "#4f46e5",
            }),
          ],
          { width: "50%" },
        ),
        column(
          [
            button("Secondary", {
              align: "left",
              "background-color": "#ffffff",
              color: "#4f46e5",
              "border": "1px solid #4f46e5",
            }),
          ],
          { width: "50%" },
        ),
      ]) as Payload,
    },
  ],
  Footers: [
    {
      title: "Logo + address",
      category: "Footers",
      thumbnail: thumbnail(
        bar(115, 35, 70, 24, "#9aa3ad") +
          bar(60, 80, 180, 8) +
          bar(90, 96, 120, 8) +
          bar(110, 120, 80, 8, "#6b7280"),
        "#f9fafb",
      ),
      payload: section(
        [
          column([
            image("https://placehold.co/300x100?text=Logo", {
              width: "100px",
              align: "center",
            }),
            text(
              ElementType.STANDARD_PARAGRAPH,
              "Your Company · 123 Street, City, Country",
              { align: "center", color: "#6b7280", "font-size": "12px" },
            ),
            text(
              ElementType.STANDARD_PARAGRAPH,
              "You can unsubscribe at any time.",
              { align: "center", color: "#6b7280", "font-size": "12px" },
            ),
          ]),
        ],
        {
          "background-color": "#f9fafb",
          "padding-top": "24px",
          "padding-bottom": "24px",
        },
      ) as Payload,
    },
  ],
};

// Categories that only exist in the extra set
const newCategories: PrebuiltBlockCategory[] = [
  {
    get label() {
      return "Products";
    },
    active: true,
    blocks: [
      {
        title: "Product card",
        category: "Products",
        thumbnail: thumbnail(
          bar(100, 10, 100, 80, "#9aa3ad") +
            bar(110, 98, 80, 10, "#374151") +
            bar(125, 114, 50, 8, "#4f46e5") +
            bar(115, 130, 70, 20, "#111827", 10),
        ),
        payload: section([productColumn("Product name", "$49.00")]) as Payload,
      },
      {
        title: "Two products",
        category: "Products",
        thumbnail: thumbnail(
          [30, 170]
            .map(
              (x) =>
                bar(x, 10, 100, 80, "#9aa3ad") +
                bar(x + 10, 98, 80, 10, "#374151") +
                bar(x + 25, 114, 50, 8, "#4f46e5") +
                bar(x + 15, 130, 70, 20, "#111827", 10),
            )
            .join(""),
        ),
        payload: section([
          productColumn("Product one", "$49.00", "50%"),
          productColumn("Product two", "$59.00", "50%"),
        ]) as Payload,
      },
    ],
  },
  {
    get label() {
      return "Events";
    },
    active: true,
    blocks: [
      {
        title: "Event details",
        category: "Events",
        thumbnail: thumbnail(
          bar(20, 20, 260, 60, "#9aa3ad") +
            bar(20, 92, 160, 14, "#374151") +
            bar(20, 114, 200, 7) +
            bar(20, 130, 80, 22, "#4f46e5", 11),
        ),
        payload: section([
          column([
            image("https://placehold.co/1200x500?text=Event+image"),
            text(ElementType.STANDARD_H2, "Event name"),
            text(ElementType.STANDARD_PARAGRAPH, "📅 Saturday, 12 October · 6:00 PM"),
            text(ElementType.STANDARD_PARAGRAPH, "📍 Venue name, City"),
            button("RSVP", {
              align: "left",
              "background-color": "#4f46e5",
            }),
          ]),
        ]) as Payload,
      },
    ],
  },
  {
    get label() {
      return "Testimonials";
    },
    active: true,
    blocks: [
      {
        title: "Customer quote",
        category: "Testimonials",
        thumbnail: thumbnail(
          `<text x="30" y="60" font-size="48" fill="#9aa3ad">&#8220;</text>` +
            bar(60, 50, 200, 8) +
            bar(60, 66, 180, 8) +
            bar(60, 82, 120, 8) +
            bar(60, 110, 80, 8, "#6b7280"),
          "#f9fafb",
        ),
        payload: section(
          [
            column([
              text(
                ElementType.STANDARD_PARAGRAPH,
                "“This made a real difference for our team. We'd recommend it to anyone.”",
                { align: "center", "font-size": "18px", "font-style": "italic" },
              ),
              text(ElementType.STANDARD_PARAGRAPH, "— Jane Doe, Company", {
                align: "center",
                color: "#6b7280",
              }),
            ]),
          ],
          {
            "background-color": "#f9fafb",
            "padding-top": "32px",
            "padding-bottom": "32px",
          },
        ) as Payload,
      },
    ],
  },
  {
    get label() {
      return "Dividers";
    },
    active: true,
    blocks: [
      {
        title: "Spaced divider",
        category: "Dividers",
        thumbnail: thumbnail(bar(30, 79, 240, 2, "#9aa3ad", 0)),
        payload: section([
          column([spacer("20px"), divider(), spacer("20px")]),
        ]) as Payload,
      },
    ],
  },
];

export const prebuiltBlocks: PrebuiltBlockCategory[] = [
  ...baseBlocks.map((category) => ({
    ...category,
    label: category.label,
    blocks: [...category.blocks, ...(extraBlocks[category.label] ?? [])],
  })),
  ...newCategories,
];
