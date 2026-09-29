"use client";
// Lets Arco's imperative APIs (Message, Modal, Notification) render on React 19
import "@arco-design/web-react/es/_util/react-19-adapter";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmailEditorProvider, EmailTemplate } from "easy-email-pro-editor";
import {
  EditorContextProps,
  IconFont,
  PrebuiltBlock,
  Retro,
  ThemeConfigProps,
} from "easy-email-pro-theme";
import "easy-email-pro-theme/lib/style.css";
import mjml from "mjml-browser";
// Theme style, If you need to change the theme, you can make a duplicate in https://arco.design/themes/design/6979/setting/base/Color
import "@arco-themes/react-easy-email-pro/css/arco.css";
import templateData from "./template.json";
import { prebuiltBlocks as starterBlocks } from "./prebuilt-blocks";
import { EditorCore } from "easy-email-pro-core";
import { ElementType, t } from "easy-email-pro-core";
import { Button, Layout } from "@arco-design/web-react";
import { BlockManager, PluginManager } from "easy-email-pro-core";
import {
  Countdown,
  CountdownV2,
  ImageWithText,
  KitElementType,
  QRCode,
  Shopwindow,
  Video,
} from "easy-email-pro-kit";
// Adds the kit's element types to easy-email-pro-core's Element type
import type {} from "easy-email-pro-kit/lib/typings/custom-types";
import { PrebuiltBlockCategory } from "easy-email-pro-theme";
import { StandardSectionElement } from "easy-email-pro-core";

// Register the kit's marketing elements so they can be used in categories
PluginManager.registerPlugins([
  Video,
  ImageWithText,
  Countdown,
  CountdownV2,
  QRCode,
  Shopwindow,
]);

// Merge tags offered in the text toolbar; mergetagsData fills them in previews
const mergetags = [
  {
    label: "User",
    value: "",
    children: [
      { label: "Name", value: "user.name" },
      { label: "Email", value: "user.email" },
    ],
  },
];

const mergetagsData = {
  user: {
    name: "John Doe",
    email: "john@example.com",
  },
};

const fontList = [
  { value: "Arial", label: "Arial" },
  {
    value: "Roboto",
    label: "Roboto",
    href: "https://fonts.googleapis.com/css2?family=Roboto",
  },
  { value: "Custom Font", label: "Custom", href: "/fonts/custom.css" },
];

const BlockIcon = ({ name }: { name: string }) => (
  <IconFont className="block-list-grid-item-icon" iconName={name} />
);

// Text badge for blocks without a built-in icon (e.g. "H1", "WR")
const TextIcon = ({ children }: { children: React.ReactNode }) => (
  <span
    className="block-list-grid-item-icon"
    style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}
  >
    {children}
  </span>
);

const DRAFT_KEY = "easy-email-pro:draft";
const AUTOSAVE_DELAY_MS = 1500;

type SaveStatus = { state: "idle" | "saving" | "saved" | "error"; at?: Date };

// Returns the draft saved by auto-save, if there is one
function loadDraft(): EmailTemplate | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as EmailTemplate) : null;
  } catch {
    return null;
  }
}

const statusText = (status: SaveStatus) => {
  switch (status.state) {
    case "saving":
      return "Saving…";
    case "saved":
      return `Saved ${status.at?.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    case "error":
      return "Auto-save failed";
    default:
      return "";
  }
};

// Fills the 66px left above the editor (see `height` in the config)
const TopBar = ({
  subject,
  status,
  onExport,
}: {
  subject: string;
  status: SaveStatus;
  onExport: () => void;
}) => (
  <div
    style={{
      height: 66,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid #e5e6eb",
      background: "#fff",
    }}
  >
    <strong style={{ fontSize: 16 }}>{subject}</strong>
    <span style={{ color: "#86909c", fontSize: 14 }}>{statusText(status)}</span>
    <Button type="primary" onClick={onExport}>
      Export HTML
    </Button>
  </div>
);

export default function MyEditor() {
  const instanceRef = useRef<EditorContextProps | null>(null);

  // Initialize editor with template data
  // You can fetch this data from your server or use a local JSON file
  // Starts from the auto-saved draft when there is one
  const initialValues: EmailTemplate = useMemo(() => {
    return (
      loadDraft() ?? {
        subject: templateData.subject,
        // JSON imports type `type` fields as plain strings
        content: templateData.content as EmailTemplate["content"],
      }
    );
  }, []);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ state: "idle" });
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
  }, []);

  // Handle file uploads (images, etc.)
  // Replace this with your actual upload implementation
  const onUpload = async (file: Blob): Promise<string> => {
    // Example: Upload to your server or CDN
    // const formData = new FormData();
    // formData.append("file", file);
    // const response = await fetch("/api/upload", {
    //   method: "POST",
    //   body: formData,
    // });
    // const { url } = await response.json();
    // return url;

    // For demo purposes, return a placeholder URL
    return Promise.resolve(
      "https://res.cloudinary.com/dfite2e16/image/upload/v1681907056/clgnivsuj0018z9ltiixmxf6k/ilh6rri61f512i7wb6yd.png",
    );
  };

  // Called by the "Export HTML" button (via instanceRef.current.submit())
  const onSubmit: ThemeConfigProps["onSubmit"] = async (values) => {
    const mjmlStr = EditorCore.toMJML({
      element: values.content,
      mode: "production",
      beautify: true,
    });

    // mjml-browser v5 is async
    const { html, errors } = await mjml(mjmlStr);
    if (errors.length) console.warn("MJML warnings:", errors);

    // TODO: send to your backend instead of logging
    console.log("Subject:", values.subject);
    console.log("HTML:", html);
  };

  // Auto-save: store the template once edits pause for AUTOSAVE_DELAY_MS
  const onChange: ThemeConfigProps["onChange"] = useCallback(
    (values: EmailTemplate) => {
      setSaveStatus({ state: "saving" });
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
          setSaveStatus({ state: "saved", at: new Date() });
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaveStatus({ state: "error" });
        }
      }, AUTOSAVE_DELAY_MS);
    },
    [],
  );

  const categories: ThemeConfigProps["categories"] = [
    {
      get label() {
        return t("Content");
      },
      active: true,
      displayType: "grid",
      blocks: [
        {
          type: ElementType.STANDARD_PARAGRAPH,
          icon: <BlockIcon name="icon-text" />,
        },
        {
          type: ElementType.STANDARD_H1,
          title: t("Heading 1"),
          icon: <TextIcon>H1</TextIcon>,
        },
        {
          type: ElementType.STANDARD_H2,
          title: t("Heading 2"),
          icon: <TextIcon>H2</TextIcon>,
        },
        {
          type: ElementType.STANDARD_H3,
          title: t("Heading 3"),
          icon: <TextIcon>H3</TextIcon>,
        },
        {
          type: ElementType.STANDARD_IMAGE,
          payload: {
            attributes: {
              "padding-top": "0px",
              "padding-bottom": "0px",
              "padding-left": "0px",
              "padding-right": "0px",
            },
          },
          icon: <BlockIcon name="icon-img" />,
        },
        {
          type: ElementType.STANDARD_BUTTON,
          payload: { attributes: { "line-height": "130%" } },
          icon: <BlockIcon name="icon-button" />,
        },
        {
          type: ElementType.STANDARD_BLOCK_QUOTE,
          title: t("Quote"),
          icon: <TextIcon>&ldquo;&rdquo;</TextIcon>,
        },
        {
          type: ElementType.STANDARD_TEXT_LIST,
          title: t("List"),
          icon: <BlockIcon name="icon-list-ul" />,
        },
        {
          type: ElementType.STANDARD_TABLE2,
          title: t("Table"),
          icon: <BlockIcon name="icon-table" />,
        },
        {
          type: ElementType.STANDARD_DIVIDER,
          payload: {
            attributes: {
              "border-width": "1px",
              "border-style": "solid",
              "border-color": "#C9CCCF",
              "padding-top": "10px",
              "padding-right": "0px",
              "padding-bottom": "10px",
              "padding-left": "0px",
            },
          },
          icon: <BlockIcon name="icon-divider" />,
        },
        {
          type: ElementType.STANDARD_SPACER,
          icon: <BlockIcon name="icon-spacing" />,
        },
        {
          type: ElementType.STANDARD_NAVBAR,
          icon: <BlockIcon name="icon-navbar" />,
        },
        {
          type: ElementType.STANDARD_SOCIAL,
          payload: {
            attributes: { "icon-size": "30px", spacing: "20px" },
          },
          icon: <BlockIcon name="icon-social" />,
        },
        {
          type: ElementType.STANDARD_HERO,
          icon: <BlockIcon name="icon-hero" />,
        },
      ],
    },
    {
      get label() {
        return t("Structure");
      },
      active: true,
      displayType: "grid",
      blocks: [
        {
          type: ElementType.STANDARD_WRAPPER,
          title: t("Wrapper"),
          icon: <TextIcon>WR</TextIcon>,
        },
        {
          type: ElementType.STANDARD_SECTION,
          title: t("Section"),
          icon: <TextIcon>SC</TextIcon>,
        },
        {
          type: ElementType.STANDARD_GROUP,
          title: t("Group"),
          icon: <TextIcon>GR</TextIcon>,
        },
      ],
    },
    {
      get label() {
        return t("Marketing");
      },
      active: true,
      displayType: "grid",
      blocks: [
        {
          type: KitElementType.COMMON_VIDEO,
          title: t("Video"),
          icon: <BlockIcon name="icon-video" />,
        },
        {
          type: KitElementType.COMMON_IMAGE_WITH_TEXT,
          title: t("Image + text"),
          icon: <TextIcon>I+T</TextIcon>,
        },
        {
          type: KitElementType.MARKETING_COUNTDOWN,
          title: t("Countdown"),
          icon: <TextIcon>⏱</TextIcon>,
        },
        {
          type: KitElementType.MARKETING_COUNTDOWN_V2,
          title: t("Countdown V2"),
          icon: <TextIcon>⏳</TextIcon>,
        },
        {
          type: KitElementType.MARKETING_QR_CODE,
          title: t("QR code"),
          icon: <TextIcon>QR</TextIcon>,
        },
        {
          type: KitElementType.MARKETING_SHOPWINDOW,
          title: t("Products"),
          icon: <BlockIcon name="icon-bag" />,
        },
      ],
    },
    {
      get label() {
        return t("Fixed");
      },
      active: true,
      displayType: "grid",
      blocks: [
        {
          type: ElementType.STANDARD_SECTION,
          title: t("Sticky header"),
          icon: <TextIcon>PH</TextIcon>,
          payload: {
            attributes: { "padding-top": "20px", "padding-bottom": "10px" },
            children: [
              {
                type: ElementType.STANDARD_COLUMN,
                data: {},
                attributes: {},
                children: [
                  {
                    type: ElementType.STANDARD_IMAGE,
                    data: {},
                    attributes: {
                      src: "https://placehold.co/300x100?text=Your+Logo",
                      width: "150px",
                      align: "center",
                    },
                    children: [],
                  },
                  BlockManager.getBlockByType(
                    ElementType.STANDARD_NAVBAR,
                  ).create(),
                ],
              },
            ],
          },
        },
        {
          type: ElementType.STANDARD_SECTION,
          title: t("Sticky footer"),
          icon: <TextIcon>PF</TextIcon>,
          payload: {
            attributes: { "padding-top": "20px", "padding-bottom": "20px" },
            children: [
              {
                type: ElementType.STANDARD_COLUMN,
                data: {},
                attributes: {},
                children: [
                  BlockManager.getBlockByType(
                    ElementType.STANDARD_SOCIAL,
                  ).create(),
                  {
                    type: ElementType.STANDARD_PARAGRAPH,
                    data: {},
                    attributes: { align: "center" },
                    children: [
                      {
                        text: "Your Company · 123 Street, City · You're receiving this email because you signed up.",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      get label() {
        return t("Layout");
      },
      active: true,
      displayType: "column",
      blocks: [
        {
          get title() {
            return t("1 column");
          },
          payload: [["100%"]],
        },
        {
          get title() {
            return t("2 column");
          },
          payload: [
            ["50%", "50%"],
            ["33%", "67%"],
            ["67%", "33%"],
            ["25%", "75%"],
            ["75%", "25%"],
          ],
        },
        {
          get title() {
            return t("3 column");
          },
          payload: [
            ["33.33%", "33.33%", "33.33%"],
            ["25%", "50%", "25%"],
            ["25%", "25%", "50%"],
            ["50%", "25%", "25%"],
          ],
        },
        {
          get title() {
            return t("4 column");
          },
          payload: [["25%", "25%", "25%", "25%"]],
        },
      ],
    },
  ];

  const headerBlock: PrebuiltBlock = {
    thumbnail: "https://example.com/header-thumbnail.png",
    title: "Header Centered Logo",
    category: "Header/Footer",
    payload: {
      type: "standard-section",
      data: {},
      attributes: {
        "background-color": "#FFFFFF",
        "padding-top": "30px",
        "padding-bottom": "30px",
      },
      children: [
        // ... section content
      ],
    },
  };

  const prebuiltBlocks: PrebuiltBlockCategory[] = [
    {
      get label() {
        return t("Header");
      },
      active: true,
      blocks: [headerBlock],
    },
    {
      get label() {
        return t("Product Card");
      },
      active: true,
      blocks: [
        // ... product card blocks
      ],
    },
  ];

  // Configure the editor with all necessary options
  const config = Retro.useCreateConfig({
    // Client ID for paid plans (optional for free tier)
    // After subscribing to a paid plan, you'll receive a client ID from support
    // Only NEXT_PUBLIC_* env vars are exposed to the browser; "FREE" selects the free tier
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "FREE",

    // Reference to access editor instance programmatically
    instanceRef: instanceRef,

    // Editor height
    height: "calc(100vh - 66px)",

    // Required handlers
    onUpload,
    initialValues: initialValues,
    onSubmit: onSubmit,
    onChange: onChange,

    // UI Features
    showSourceCode: true, // Show JSON source code panel
    showLayer: true, // Show layer tree in sidebar
    showPreview: true, // Show email preview
    showSidebar: true, // Show left sidebar with blocks
    showBlockPaths: true, // Show breadcrumb path for selected block
    compact: true, // true = Style panel in a separate right sidebar
    showDragMoveIcon: true, // Show drag handle icons
    showInsertTips: true, // Show insertion hints
    showPreviousLevelIcon: true,
    showTextDirectionMode: true, // Show text direction mode (LTR/RTL)
    showTextHTMLMode: true, // Show HTML editing mode for text blocks
    showLogic: true,
    controller: true,
    showGenerateBlockImage: true,

    // Feature Flags
    enabledAutoComplete: true, // Enable automatic container structure completion

    categories,
    // Merge tags need a paid plan (DYNAMIC_RENDER); passing them on the free
    // tier makes the editor throw "Current plan do not support mergetags"
    mergetags: process.env.NEXT_PUBLIC_CLIENT_ID ? mergetags : undefined,
    mergetagsData,
    fontList,

    // The tab bar only renders when this is set. Saving universal blocks
    // needs a paid plan, so the Universal tab stays empty on the free tier.
    universalElementSetting: {
      elements: {},
      list: [],
      onAddElement: () =>
        Promise.reject(new Error("Universal blocks require a paid plan")),
      onUpdateElement: () =>
        Promise.reject(new Error("Universal blocks require a paid plan")),
    },

    // Shown in the Prebuilt tab: your blocks, then the starter set
    prebuiltBlocks: [...prebuiltBlocks, ...starterBlocks],
  });

  return (
    <EmailEditorProvider {...config}>
      <TopBar
        subject={instanceRef.current?.values.subject ?? initialValues.subject}
        status={saveStatus}
        onExport={() => instanceRef.current?.submit()}
      />
      <Retro.Layout></Retro.Layout>
    </EmailEditorProvider>
  );
}
