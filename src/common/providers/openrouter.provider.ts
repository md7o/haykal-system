import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequestBody {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

@Injectable()
export class OpenRouterProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY', '');
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is not set');
    }
  }

  async sendRequest(
    messages: OpenRouterMessage[],
    model: string = 'deepseek/deepseek-r1-0528:free',
    options?: {
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<OpenRouterResponse> {
    const requestBody: OpenRouterRequestBody = {
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens ?? 2048,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  async generateResponse(
    userPrompt: string,
    systemPrompt?: string,
    model?: string,
    options?: {
      temperature?: number;
      max_tokens?: number;
    },
  ): Promise<string> {
    const messages: OpenRouterMessage[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    messages.push({
      role: 'user',
      content: userPrompt,
    });

    const response = await this.sendRequest(messages, model, options);

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }

    throw new Error('No response from OpenRouter API');
  }
}
