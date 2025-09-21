import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductRepository } from '../schema/product.repository';
import { ProductScraperService } from '../scraper.service';
import { AiNewsService } from '../ai-news.service';

@Injectable()
export class CronJob {
  constructor(
    private productRepository: ProductRepository,
    private scraper: ProductScraperService,
    private aiNews: AiNewsService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleNewProductPrice() {
    console.log('Treating new Product price');
    await this.productRepository.setDailyProductPrice();

    const html = process.env.AFRICA_EXCHANGE_HTML;
    if (!html) return;

    try {
      const scraped = await this.scraper.fetchPricesFromHtml(html);
      for (const item of scraped) {
        const product = await this.productRepository.getSingleProduct({
          commonName: item.commonName,
        });
        if (product?.isMonitored) {
          await this.productRepository.upsertTodayPrice(
            product._id,
            item.currentPrice,
          );
        }
      }
    } catch (err) {
      console.error('Failed to update monitored prices', err);
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshProducts() {
    try {
      // Provide HTML via env var if network is disabled
      const html = process.env.AFRICA_EXCHANGE_HTML;
      if (!html) {
        console.warn('AFRICA_EXCHANGE_HTML not provided; skipping scrape');
        return;
      }
      const products = await this.scraper.fetchProductsFromHtml(html);
      for (const p of products) {
        const saved = await this.productRepository.addProduct({
          ...p,
          isMonitored: true,
        });
        await this.productRepository.upsertTodayPrice(saved._id, p.currentPrice);
      }
    } catch (err) {
      console.error('Failed to refresh products', err);
    }
  }

  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_DAY_AT_11AM)
  async processDailyNews() {
    const linksEnv = process.env.DAILY_NEWS_LINKS;
    if (!linksEnv) {
      console.warn('DAILY_NEWS_LINKS not provided; skipping news');
      return;
    }

    let links: { title: string; url: string }[];
    try {
      links = JSON.parse(linksEnv);
      if (!Array.isArray(links)) {
        console.warn('DAILY_NEWS_LINKS is not an array; skipping news');
        return;
      }
    } catch (err) {
      console.error('Failed to parse DAILY_NEWS_LINKS', err);
      return;
    }

    await this.aiNews.processDailyNews(links);
  }
}
