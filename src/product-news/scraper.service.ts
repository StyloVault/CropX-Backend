import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { OpenAIService } from '../common/services/openai.service';
import { NewProductDto } from './dto/product.dto';

/**
 * Service responsible for extracting product data from external sources.
 * The environment running this code might not have outbound network access.
 * If network access is blocked, provide the HTML content manually when calling
 * fetchProductsFromHtml().
 */
@Injectable()
export class ProductScraperService {
  private readonly logger = new Logger(ProductScraperService.name);

  constructor(private readonly openai: OpenAIService) {}

  /**
   * Attempts to download HTML from the given URL and extract product data using OpenAI.
   * Will throw if HTTP requests are not allowed in the execution environment.
   */
  async fetchProductsFromUrl(url: string): Promise<NewProductDto[]> {
    const resp = await axios.get(url);
    return this.fetchProductsFromHtml(resp.data);
  }

  /**
   * Uses OpenAI to parse raw HTML and return a list of products conforming to NewProductDto.
   */
  async fetchProductsFromHtml(html: string): Promise<(NewProductDto & { currentPrice: number })[]> {
    const completion = await this.openai.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content:
            'Extract all product information from the following HTML. ' +
            'Return JSON array of objects with fields: productName, commonName, productImage, productLocation, unitOfMeasure, currentPrice.\n' +
            'Make sure you stick to the product that there is a price for and its on their stock list, this is targeting farm product.\n' +
            html,
        },
      ],
    });
    console.log("Completion: ", completion)

    try {
      const data = JSON.parse(completion);
      return Array.isArray(data)
        ? (data as (NewProductDto & { currentPrice: number })[])
        : [];
    } catch (err) {
      this.logger.error('Failed to parse OpenAI response', err);
      return [];
    }
  }

  /**
   * Extracts just the current price for products from raw HTML. Returns an array
   * of objects containing commonName and currentPrice.
   */
  async fetchPricesFromHtml(html: string): Promise<{ commonName: string; currentPrice: number }[]> {
    const completion = await this.openai.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content:
            'From the following HTML extract product common name and price in naira. ' +
            'Return JSON array of objects with fields: commonName and currentPrice.\n' +
            html,
        },
      ],
    });

    try {
      const data = JSON.parse(completion);
      return Array.isArray(data)
        ? (data as { commonName: string; currentPrice: number }[])
        : [];
    } catch (err) {
      this.logger.error('Failed to parse OpenAI response', err);
      return [];
    }
  }

  /**
   * Generates an image URL for a given product using OpenAI's image generation API.
   */
  async generateProductImage(prompt: string): Promise<string> {
    return this.openai.generateImage(prompt);
  }
}
