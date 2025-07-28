import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OpenAIService } from '../common/services/openai.service';
import { ProductsNewsService } from './product-news.service';
import { Types } from 'mongoose';

interface NewsLink { title: string; url: string; }

@Injectable()
export class AiNewsService {
  private readonly logger = new Logger(AiNewsService.name);
  constructor(
    private readonly openai: OpenAIService,
    private readonly newsService: ProductsNewsService,
  ) {}

  async processDailyNews(links: NewsLink[]): Promise<void> {
    const limitedLinks = links.slice(0, 10);
    const summaries: { link: string; summary: string; title: string; image: string }[] = [];
    for (const link of limitedLinks) {
      try {
        const resp = await axios.get(link.url);
        const summary = await this.openai.summarize(resp.data);
        const image = await this.openai.generateImage(link.title);
        summaries.push({ link: link.url, summary, title: link.title, image });
      } catch (err) {
        this.logger.error('Failed processing news', err);
      }
    }

    const top3 = summaries.slice(0, 3);
    for (const news of top3) {
      await this.newsService.createNews({
        product: undefined as unknown as Types.ObjectId,
        newsTopic: news.title,
        newsBody: news.summary,
        images: [news.image],
        author: 'AI',
        externalLink: news.link,
        newsSubTopic: '',
        metaData: 'AI generated',
      });
    }
  }
}
