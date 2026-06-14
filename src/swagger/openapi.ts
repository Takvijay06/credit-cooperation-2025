import { months } from "../common/constant.js";
import { Routes } from "../routes/config.js";

const monthEnum = months as unknown as string[];

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Credit Co-operation Society API",
    version: "1.0.0",
    description:
      "REST API for credit co-operative society — user registration, OTP verification, admin approvals, and monthly financial entry tracking.",
  },
  servers: [
    {
      url: "http://localhost:{port}",
      description: "Local development",
      variables: {
        port: { default: "5000" },
      },
    },
  ],
  tags: [
    { name: "Auth", description: "Registration, login, and email OTP" },
    { name: "Admin", description: "Admin-only user approvals and financial operations" },
    { name: "User", description: "Authenticated user financial data" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token from POST /api/v1/auth/login",
      },
    },
    schemas: {
      ApiResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 200 },
          data: { nullable: true },
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Success" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["fullName", "email", "serialNumber", "password"],
        properties: {
          fullName: { type: "string", example: "John Doe" },
          email: { type: "string", format: "email", example: "john@example.com" },
          serialNumber: { type: "integer", example: 1001 },
          password: { type: "string", format: "password", example: "SecurePass123" },
          phoneNumber: { type: "string", example: "9876543210" },
          emergencyPerson: { type: "string", example: "Jane Doe" },
          emergencyContact: { type: "string", example: "9876543211" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "john@example.com" },
          password: { type: "string", format: "password", example: "SecurePass123" },
        },
      },
      OtpVerifyRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email", example: "john@example.com" },
          otp: { type: "integer", example: 1234 },
        },
      },
      ResendOtpRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email", example: "john@example.com" },
        },
      },
      UserSummary: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          serialNumber: { type: "integer" },
        },
      },
      FinancialEntryInput: {
        type: "object",
        required: ["serialNumber", "year", "month"],
        properties: {
          serialNumber: { type: "integer", example: 1001 },
          year: { type: "integer", example: 2025, minimum: 2000, maximum: 2100 },
          month: { type: "string", enum: monthEnum, example: "January" },
          loanTaken: { type: "number", default: 0, example: 5000 },
          collection: { type: "number", default: 0, example: 1000 },
          fine: { type: "number", default: 0, example: 0 },
          instalment: { type: "number", default: 0, example: 500 },
        },
      },
      FinancialEntryEditInput: {
        allOf: [{ $ref: "#/components/schemas/FinancialEntryInput" }],
        description: "All fields except serialNumber, year, month are optional for partial updates.",
      },
      DepositRequest: {
        type: "object",
        required: ["serialNumber", "year", "month"],
        properties: {
          serialNumber: { type: "integer", example: 1001 },
          year: { type: "integer", example: 2025 },
          month: { type: "string", enum: monthEnum, example: "January" },
        },
      },
      MonthYearRequest: {
        type: "object",
        required: ["year", "month"],
        properties: {
          year: { type: "integer", example: 2025 },
          month: { type: "string", enum: monthEnum, example: "January" },
        },
      },
      FinancialEntryWithUser: {
        type: "object",
        properties: {
          month: { type: "string" },
          loanTaken: { type: "number" },
          collection: { type: "number" },
          fine: { type: "number" },
          interest: { type: "number", nullable: true },
          instalment: { type: "number" },
          total: { type: "number" },
          pendingLoan: { type: "number" },
          status: { type: "string", enum: ["pending", "deposit"] },
          isFreezed: { type: "boolean" },
          fullName: { type: "string" },
          serialNumber: { type: "integer" },
          year: { type: "integer" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          statusCode: { type: "integer", example: 400 },
          message: { type: "string" },
          success: { type: "boolean", example: false },
        },
      },
    },
  },
  paths: {
    [`${Routes.auth.baseUrl}${Routes.auth.path.register}`]: {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates a user account and sends an OTP to the provided email.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterRequest" } },
          },
        },
        responses: {
          "200": {
            description: "User registered; OTP sent",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          "409": {
            description: "User already exists",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.auth.baseUrl}${Routes.auth.path.login}`]: {
      post: {
        tags: ["Auth"],
        summary: "Login",
        description: "Returns a JWT access token for an active, verified user.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: { token: { type: "string" } },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": {
            description: "Invalid credentials or inactive user",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.auth.baseUrl}${Routes.auth.path.verifyOtp}`]: {
      patch: {
        tags: ["Auth"],
        summary: "Verify email with OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/OtpVerifyRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Email verified",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          "400": {
            description: "Invalid or incorrect OTP",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.auth.baseUrl}${Routes.auth.path.resendOtp}`]: {
      post: {
        tags: ["Auth"],
        summary: "Resend OTP",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/ResendOtpRequest" } },
          },
        },
        responses: {
          "200": {
            description: "OTP resent",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.approvalRequest}`]: {
      get: {
        tags: ["Admin"],
        summary: "List pending user approval requests",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Pending users list",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/UserSummary" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.approveRequest}`]: {
      put: {
        tags: ["Admin"],
        summary: "Approve a user registration request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            description: "User serial number",
            schema: { type: "integer", example: 1001 },
          },
        ],
        responses: {
          "200": {
            description: "User approved; returns updated pending list",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.deleteRequest}`]: {
      put: {
        tags: ["Admin"],
        summary: "Reject a user registration request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            description: "User serial number",
            schema: { type: "integer", example: 1001 },
          },
        ],
        responses: {
          "200": {
            description: "Request rejected; returns updated pending list",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.financialEntry}`]: {
      get: {
        tags: ["Admin"],
        summary: "Get all users' financial entries for a month and year",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "month", in: "query", required: true, schema: { type: "string", enum: monthEnum } },
          { name: "year", in: "query", required: true, schema: { type: "integer", example: 2025 } },
        ],
        responses: {
          "200": {
            description: "Financial entries for the given month/year",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "array",
                          items: { $ref: "#/components/schemas/FinancialEntryWithUser" },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Insert a financial entry for a user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/FinancialEntryInput" } },
          },
        },
        responses: {
          "200": {
            description: "Entry inserted",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
          "409": { description: "Entry already exists for this month" },
        },
      },
      put: {
        tags: ["Admin"],
        summary: "Edit a financial entry",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/FinancialEntryEditInput" } },
          },
        },
        responses: {
          "200": {
            description: "Entry updated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
      patch: {
        tags: ["Admin"],
        summary: "Mark society deposit for a user's entry",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/DepositRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Deposit recorded",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.usersWithLoan}`]: {
      get: {
        tags: ["Admin"],
        summary: "Get users who took a loan in a given month/year",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "month", in: "query", required: true, schema: { type: "string", enum: monthEnum } },
          { name: "year", in: "query", required: true, schema: { type: "integer", example: 2025 } },
        ],
        responses: {
          "200": {
            description: "Users with loanTaken > 0",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ApiResponse" } },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.autoFinancialEntry}`]: {
      post: {
        tags: ["Admin"],
        summary: "Auto-insert financial entries for all verified users",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/MonthYearRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Bulk insert completed",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: { count: { type: "integer" } },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    [`${Routes.admin.baseUrl}${Routes.admin.path.freezeFinancialEntry}`]: {
      put: {
        tags: ["Admin"],
        summary: "Freeze financial entries for all active users in a month/year",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/MonthYearRequest" } },
          },
        },
        responses: {
          "200": {
            description: "Entries frozen",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: { updatedCount: { type: "integer" } },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    [`${Routes.user.baseUrl}${Routes.user.path.financialEntry}`]: {
      get: {
        tags: ["User"],
        summary: "Get financial data for a year",
        description:
          "Regular users see their own data. Admins may pass `serialNumber` query param to view any user.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "year", in: "query", required: true, schema: { type: "integer", example: 2025 } },
          {
            name: "serialNumber",
            in: "query",
            required: false,
            description: "Required when caller is admin",
            schema: { type: "integer", example: 1001 },
          },
        ],
        responses: {
          "200": {
            description: "Yearly financial entries",
            content: {
              "application/json": {
                schema: {
                  allOf: [
                    { $ref: "#/components/schemas/ApiResponse" },
                    {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            entries: {
                              type: "array",
                              items: { $ref: "#/components/schemas/FinancialEntryWithUser" },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
