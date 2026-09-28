"use client";
// Lets Arco's imperative APIs (Message, Modal, Notification) render on React 19
import "@arco-design/web-react/es/_util/react-19-adapter";
import React, { useMemo, useRef } from "react";
import { EmailEditorProvider, EmailTemplate } from "easy-email-pro-editor";
import {
  EditorContextProps,
  Retro,
  ThemeConfigProps,
} from "easy-email-pro-theme";
import "easy-email-pro-theme/lib/style.css";
import mjml from "mjml-browser";
// Theme style, If you need to change the theme, you can make a duplicate in https://arco.design/themes/design/6979/setting/base/Color
import "@arco-themes/react-easy-email-pro/css/arco.css";
import templateData from "./template.json";
import { EditorCore } from "easy-email-pro-core";
import axios from "axios";

export default function MyEditor() {
  const instanceRef = useRef<EditorContextProps | null>(null);

  // Initialize editor with template data
  // You can fetch this data from your server or use a local JSON file
  const initialValues: EmailTemplate = useMemo(() => {
    return {
      subject: templateData.subject,
      content: templateData.content,
    };
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

  // Handle form submission
  // This is called when the user clicks the save/submit button
  const onSubmit: ThemeConfigProps["onSubmit"] = async (values, editor) => {
    console.log("Template values:", values);
    console.log("Editor instance:", editor);

    // Convert the template to MJML format
    const mjmlStr = EditorCore.toMJML({
      element: values.content,
      mode: "production",
      beautify: true,
    });

    // Convert MJML to HTML using mjml-browser
    const html = mjml(mjmlStr).html;

    // Send to your backend API
    await axios.post("/your-server-url", {
      content: values.content,
      subject: values.subject,
      html: html,
    });
  };

  // Handle real-time changes
  // This is called whenever the template is modified
  const onChange: ThemeConfigProps["onChange"] = async (values, editor) => {
    console.log("Template changed:", values);
    // Optional: Auto-save, validation, etc.
  };

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
  });

  return (
    <EmailEditorProvider {...config}>
      <Retro.Layout></Retro.Layout>
    </EmailEditorProvider>
  );
}
