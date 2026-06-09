/**
 * LLM port — the boundary the application depends on, independent of any provider.
 * The Ollama adapter (src/core/chat/llm.ts) is one implementation; swapping to vLLM,
 * a hosted gateway, or the OpenAI API later means writing a new adapter, not touching
 * the routes or application logic.
 */
import type { ChatMessage } from "@/src/core/chat/llm";

export interface LlmChatRequest {
  model: string;
  messages: ChatMessage[];
  options?: Record<string, unknown>;
}

export interface LlmPort {
  /** Stream a chat completion as the provider's raw NDJSON byte stream. */
  chatStream(req: LlmChatRequest): Promise<Response>;
  /** List locally-available model identifiers. */
  listModels(): Promise<string[]>;
}
