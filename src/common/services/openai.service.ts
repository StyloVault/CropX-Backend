import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AppConfig } from '../../config.schema';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: AppConfig.OPENAI_KEY });
  }

  async summarize(text: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Summarize this news:\n${text}` }],
      max_tokens: 200,
      stream: false,
    });
    const result = completion as OpenAI.Chat.ChatCompletion;
    return result.choices[0].message?.content?.trim() || '';
  }

  async generateImage(prompt: string): Promise<string> {
    const image = await this.openai.images.generate({
      prompt,
      n: 1,
      size: '1024x1024',
      model: 'dall-e-3',
      style: 'vivid',
    });
    return image.data?.[0]?.url || '';
  }

  /**
   * Performs a generic chat completion request. Returns the raw message content.
   */
  async chat(params: OpenAI.Chat.ChatCompletionCreateParams): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      ...params,
      stream: false,
    });
    const result = completion as OpenAI.Chat.ChatCompletion;
    return result.choices[0].message?.content?.trim() || '';
  }
}
