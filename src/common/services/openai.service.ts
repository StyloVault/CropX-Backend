import { Injectable } from '@nestjs/common';
import { Configuration, OpenAIApi } from 'openai';
import { AppConfig } from '../../config.schema';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({ apiKey: AppConfig.OPENAI_KEY });
    this.openai = new OpenAIApi(configuration);
  }

  async summarize(text: string): Promise<string> {
    const completion = await this.openai.createChatCompletion({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: `Summarize this news:\n${text}` }],
      max_tokens: 200,
    });
    return completion.data.choices[0].message?.content?.trim() || '';
  }

  async generateImage(prompt: string): Promise<string> {
    const image = await this.openai.createImage({
      prompt,
      n: 1,
      size: '1024x1024',
      model: 'dall-e-3',
      style: 'vivid',
    });
    return image.data.data[0]?.url || '';
  }
}
