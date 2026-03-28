"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./ui.css";

export default function DocsPage() {
    return <SwaggerUI url="/swagger/data" />;
}
