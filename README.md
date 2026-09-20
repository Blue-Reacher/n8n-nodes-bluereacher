# n8n-nodes-bluereacher

n8n community node for the [Blue Reacher](https://bluereacher.com) API. Send iMessage from your n8n workflows over a dedicated line, check which numbers are iMessage-capable, read conversation history, and manage contacts and opt-outs. No A2P registration required.

Docs: https://docs.bluereacher.com
OpenAPI: https://docs.bluereacher.com/openapi.json

## Installation

In n8n: Settings > Community Nodes > Install, then enter `n8n-nodes-bluereacher`.

Self-hosted via npm:

```bash
npm install n8n-nodes-bluereacher
```

## Credentials

Create a "Blue Reacher API" credential with your API key. Test keys (`brk_test_`) hit a simulator and never send a real message, so you can build and run workflows safely before going live with a `brk_live_` key. The credential test calls `GET /v1/devices` and lists your sending lines.

## Operations

### Message

- Send: text and/or media to an E.164 number. Drip (paced) by default, which is what keeps lines deliverable; instant mode dispatches now and can carry a native iMessage effect (confetti, balloons, slam, invisible ink and more).
- Get Status: delivery status of a queued message by ID.

### Contact

- Create or Update: upsert by phone number, with name, email, company, tags and notes.
- Search: filter by search text, phone, email or tag.

### Conversation

- Get: message history for a phone number's 1:1 thread.

### Capability

- Check: iMessage vs SMS capability for a list of phone numbers, so a workflow can branch before sending.

### Opt-Out

- Get: read a contact's opt-out state.
- Set: opt a contact out. Opting back in requires explicit confirmation via the API; see the docs.

## Example: speed-to-lead

1. Webhook trigger receives a form fill from your CRM.
2. Blue Reacher > Capability > Check on the lead's number.
3. IF iMessage-capable, Blue Reacher > Message > Send (instant) with a first touch.
4. Blue Reacher > Contact > Create or Update tags the lead `contacted-imessage`.

Inbound replies arrive on your webhook endpoint registered via `POST /v1/webhooks` (see the [docs](https://docs.bluereacher.com)); point a second n8n Webhook trigger at it to route replies back into the workflow.

## Compatibility

Requires n8n 1.x and Node 18+. The node is declarative-style, marked `usableAsTool`, so it also works as a tool inside n8n AI agents.

## Resources

- [Blue Reacher docs](https://docs.bluereacher.com)
- [TypeScript SDK](https://github.com/Blue-Reacher/bluereacher-node)
- [Python client](https://github.com/Blue-Reacher/bluereacher-python)
- [MCP server](https://github.com/Blue-Reacher/bluereacher-mcp)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
