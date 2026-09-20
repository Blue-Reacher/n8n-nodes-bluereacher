import type { INodeType, INodeTypeDescription } from "n8n-workflow";

// Declarative-style node: every operation maps straight onto one Blue Reacher
// API request, so the node stays in lockstep with the public OpenAPI spec at
// https://docs.bluereacher.com/openapi.json.
export class BlueReacher implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Blue Reacher",
    name: "blueReacher",
    icon: "file:bluereacher.svg",
    group: ["output"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      "Send iMessage over a dedicated line, check iMessage capability, and manage contacts and opt-outs",
    defaults: {
      name: "Blue Reacher",
    },
    inputs: ["main"],
    outputs: ["main"],
    usableAsTool: true,
    credentials: [
      {
        name: "blueReacherApi",
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: "https://api.bluereacher.com/v1",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    },
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          { name: "Message", value: "message" },
          { name: "Contact", value: "contact" },
          { name: "Conversation", value: "conversation" },
          { name: "Capability", value: "capability" },
          { name: "Opt-Out", value: "optOut" },
        ],
        default: "message",
      },

      // ----------------------------- message -----------------------------
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["message"] } },
        options: [
          {
            name: "Send",
            value: "send",
            action: "Send an iMessage",
            description:
              "Send a text or media message (paced drip by default, or instant)",
            routing: { request: { method: "POST", url: "/messages" } },
          },
          {
            name: "Get Status",
            value: "getStatus",
            action: "Get delivery status",
            description: "Delivery status of a queued message",
            routing: {
              request: {
                method: "GET",
                url: '=/status/{{$parameter["messageId"]}}',
              },
            },
          },
        ],
        default: "send",
      },
      {
        displayName: "To",
        name: "to",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101",
        description: "Recipient phone number in E.164 format",
        displayOptions: { show: { resource: ["message"], operation: ["send"] } },
        routing: { send: { type: "body", property: "to" } },
      },
      {
        displayName: "Message",
        name: "message",
        type: "string",
        typeOptions: { rows: 3 },
        default: "",
        description: "Message text. Required unless media URLs are set.",
        displayOptions: { show: { resource: ["message"], operation: ["send"] } },
        routing: { send: { type: "body", property: "message" } },
      },
      {
        displayName: "Send Mode",
        name: "sendMode",
        type: "options",
        options: [
          { name: "Drip (Paced)", value: "drip" },
          { name: "Instant", value: "instant" },
        ],
        default: "drip",
        description:
          "Drip queues through the paced pipeline that keeps lines deliverable; instant dispatches now",
        displayOptions: { show: { resource: ["message"], operation: ["send"] } },
        routing: { send: { type: "body", property: "send_mode" } },
      },
      {
        displayName: "Additional Fields",
        name: "additionalFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: { show: { resource: ["message"], operation: ["send"] } },
        options: [
          {
            displayName: "Media URLs",
            name: "mediaUrls",
            type: "string",
            default: "",
            description:
              "Comma-separated list of up to 10 https:// URLs to attach",
            routing: {
              send: {
                type: "body",
                property: "media_urls",
                value:
                  '={{$value ? $value.split(",").map(u => u.trim()).filter(u => u) : undefined}}',
              },
            },
          },
          {
            displayName: "Message Effect",
            name: "messageEffect",
            type: "options",
            options: [
              { name: "Balloons", value: "balloons" },
              { name: "Celebration", value: "celebration" },
              { name: "Confetti", value: "confetti" },
              { name: "Echo", value: "echo" },
              { name: "Fireworks", value: "fireworks" },
              { name: "Gentle", value: "gentle" },
              { name: "Invisible Ink", value: "invisibleink" },
              { name: "Lasers", value: "lasers" },
              { name: "Loud", value: "loud" },
              { name: "Love", value: "love" },
              { name: "Slam", value: "slam" },
              { name: "Spotlight", value: "spotlight" },
            ],
            default: "confetti",
            description:
              "Native iMessage effect. Requires instant send mode; a drip send with an effect returns 400.",
            routing: { send: { type: "body", property: "message_effect" } },
          },
          {
            displayName: "Device ID",
            name: "deviceId",
            type: "string",
            default: "",
            description:
              "Explicit line UUID, or auto_load_balanced / auto_round_robin. Omit to use the key's default line.",
            routing: { send: { type: "body", property: "device_id" } },
          },
          {
            displayName: "Delay (Minutes)",
            name: "delayMinutes",
            type: "number",
            default: 10,
            description: "Drip only: minutes from now to schedule the send",
            routing: { send: { type: "body", property: "delay_minutes" } },
          },
        ],
      },
      {
        displayName: "Message ID",
        name: "messageId",
        type: "string",
        required: true,
        default: "",
        description: "The message ID returned by a send",
        displayOptions: {
          show: { resource: ["message"], operation: ["getStatus"] },
        },
      },

      // ----------------------------- contact -----------------------------
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["contact"] } },
        options: [
          {
            name: "Create or Update",
            value: "upsert",
            action: "Create or update a contact",
            description: "Create a contact (upsert by phone)",
            routing: { request: { method: "POST", url: "/contacts" } },
          },
          {
            name: "Search",
            value: "search",
            action: "Search contacts",
            description: "Search and list contacts",
            routing: { request: { method: "GET", url: "/contacts" } },
          },
        ],
        default: "upsert",
      },
      {
        displayName: "Phone Number",
        name: "phoneNumber",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101",
        description: "Contact phone number in E.164 format",
        displayOptions: { show: { resource: ["contact"], operation: ["upsert"] } },
        routing: { send: { type: "body", property: "phone_number" } },
      },
      {
        displayName: "Additional Fields",
        name: "contactFields",
        type: "collection",
        placeholder: "Add Field",
        default: {},
        displayOptions: { show: { resource: ["contact"], operation: ["upsert"] } },
        options: [
          {
            displayName: "First Name",
            name: "firstName",
            type: "string",
            default: "",
            routing: { send: { type: "body", property: "first_name" } },
          },
          {
            displayName: "Last Name",
            name: "lastName",
            type: "string",
            default: "",
            routing: { send: { type: "body", property: "last_name" } },
          },
          {
            displayName: "Email",
            name: "email",
            type: "string",
            placeholder: "name@email.com",
            default: "",
            routing: { send: { type: "body", property: "email" } },
          },
          {
            displayName: "Company",
            name: "company",
            type: "string",
            default: "",
            routing: { send: { type: "body", property: "company" } },
          },
          {
            displayName: "Tags",
            name: "tags",
            type: "string",
            default: "",
            description: "Comma-separated list of tags",
            routing: {
              send: {
                type: "body",
                property: "tags",
                value:
                  '={{$value ? $value.split(",").map(t => t.trim()).filter(t => t) : undefined}}',
              },
            },
          },
          {
            displayName: "Notes",
            name: "notes",
            type: "string",
            default: "",
            routing: { send: { type: "body", property: "notes" } },
          },
        ],
      },
      {
        displayName: "Filters",
        name: "contactFilters",
        type: "collection",
        placeholder: "Add Filter",
        default: {},
        displayOptions: { show: { resource: ["contact"], operation: ["search"] } },
        options: [
          {
            displayName: "Search",
            name: "search",
            type: "string",
            default: "",
            routing: { send: { type: "query", property: "search" } },
          },
          {
            displayName: "Phone",
            name: "phone",
            type: "string",
            default: "",
            routing: { send: { type: "query", property: "phone" } },
          },
          {
            displayName: "Email",
            name: "email",
            type: "string",
            placeholder: "name@email.com",
            default: "",
            routing: { send: { type: "query", property: "email" } },
          },
          {
            displayName: "Tag",
            name: "tag",
            type: "string",
            default: "",
            routing: { send: { type: "query", property: "tag" } },
          },
          {
            displayName: "Page",
            name: "page",
            type: "number",
            default: 1,
            routing: { send: { type: "query", property: "page" } },
          },
        ],
      },

      // --------------------------- conversation ---------------------------
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["conversation"] } },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get a conversation",
            description: "Conversation history for a phone number",
            routing: { request: { method: "GET", url: "/conversations" } },
          },
        ],
        default: "get",
      },
      {
        displayName: "Phone",
        name: "phone",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101",
        description: "E.164 phone number of the 1:1 thread to read",
        displayOptions: { show: { resource: ["conversation"], operation: ["get"] } },
        routing: { send: { type: "query", property: "phone" } },
      },
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        typeOptions: { minValue: 1 },
        default: 50,
        description: "Max number of results to return",
        displayOptions: { show: { resource: ["conversation"], operation: ["get"] } },
        routing: { send: { type: "query", property: "limit" } },
      },

      // ---------------------------- capability ----------------------------
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["capability"] } },
        options: [
          {
            name: "Check",
            value: "check",
            action: "Check iMessage capability",
            description: "iMessage vs SMS capability for phone numbers",
            routing: { request: { method: "POST", url: "/capability" } },
          },
        ],
        default: "check",
      },
      {
        displayName: "Phones",
        name: "phones",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101, +13035550102",
        description: "Comma-separated E.164 phone numbers to check",
        displayOptions: { show: { resource: ["capability"], operation: ["check"] } },
        routing: {
          send: {
            type: "body",
            property: "phones",
            value: '={{$value.split(",").map(p => p.trim()).filter(p => p)}}',
          },
        },
      },

      // ----------------------------- opt-out ------------------------------
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["optOut"] } },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get opt-out state",
            description: "Read a contact's opt-out state by phone",
            routing: { request: { method: "GET", url: "/opt-out" } },
          },
          {
            name: "Set",
            value: "set",
            action: "Set opt-out state",
            description: "Opt a contact out",
            routing: { request: { method: "POST", url: "/opt-out" } },
          },
        ],
        default: "get",
      },
      {
        displayName: "Phone",
        name: "optOutPhone",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101",
        description: "E.164 phone number",
        displayOptions: { show: { resource: ["optOut"], operation: ["get"] } },
        routing: { send: { type: "query", property: "phone" } },
      },
      {
        displayName: "Phone",
        name: "optOutPhoneSet",
        type: "string",
        required: true,
        default: "",
        placeholder: "+13035550101",
        description: "E.164 phone number",
        displayOptions: { show: { resource: ["optOut"], operation: ["set"] } },
        routing: { send: { type: "body", property: "phone" } },
      },
      {
        displayName: "Opted Out",
        name: "optedOut",
        type: "boolean",
        default: true,
        description:
          "Whether the contact is opted out. Resubscribing (false) additionally requires explicit confirmation via the API; see the docs.",
        displayOptions: { show: { resource: ["optOut"], operation: ["set"] } },
        routing: { send: { type: "body", property: "opted_out" } },
      },
    ],
  };
}
