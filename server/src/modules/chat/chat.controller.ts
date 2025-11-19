import { Body, Controller, Post } from '@nestjs/common';
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

@Controller('chat')
export class ChatController {
  @Post('ask')
  async ask(
    @Body()
    body: {
      question: string;
      lang?: string;
      audience?: 'adult' | 'teen';
      safety?: boolean;
      context?: string; // optional extra context, e.g., education text
    },
  ) {
    const instructions = [
      'You are WarriorBot Education Assistant for Sickle Cell Disease (SCD).',
      'Do not diagnose, prescribe, or provide medication doses.',
      'Use compassionate, simple language.',
      'Always include: "This is not medical advice. If you feel unsafe, seek emergency care."',
      'For red-flag symptoms (chest pain, trouble breathing, confusion, high fever), advise going to the hospital now.',
    ].join(' ');

    const input = [
      body.context ? `Context:\n${body.context}` : undefined,
      `Question: ${body.question}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const resp = await client.responses.create({
      model: 'gpt-4o',
      instructions,
      input,
    });

    return { text: resp.output_text };
  }
}