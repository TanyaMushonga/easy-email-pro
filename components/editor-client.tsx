'use client'
import dynamic from "next/dynamic";

// easy-email-pro accesses `document` at import time, so it must never be
// evaluated on the server.
const MyEditor = dynamic(() => import("./editor"), { ssr: false });

export default MyEditor;
