import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.3",
        info: {
            title: "SyncmaticaLand OpenAPI",
            version: "0.2.0",
            description: "SyncmaticaLand OpenAPI Specification",
        },
    },
    // 扫描 API 文件的注释
    apis: [path.join(process.cwd(), "src/app/(backend)/api/**/*.ts")],
});
