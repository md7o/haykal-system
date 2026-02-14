import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAiStudioDto } from './dto/create-ai-studio.dto';
import { UpdateAiStudioDto } from './dto/update-ai-studio.dto';
import { Idea } from './entities/idea.entity';
import { OpenRouterProvider } from '../common/providers/openrouter.provider';
import { STARTUP_STRATEGIST_PROMPT } from './prompts/startup-strategist.prompt';
import { BusinessBriefSchema } from './schemas/business-brief.schema';

@Injectable()
export class AiStudioService {
  constructor(
    @InjectRepository(Idea) private readonly ideaRepository: Repository<Idea>,
    private readonly openRouterProvider: OpenRouterProvider,
  ) {}

  async create(dto: CreateAiStudioDto, userId: string) {
    let answersData = dto.answersData || {};
    let aiAnalysis: any = null;

    if (answersData && Object.keys(answersData).length > 0) {
      const userContent = this.formatPromptFromAnswers(answersData);

      const aiRawResponse = await this.openRouterProvider.generateResponse(
        userContent,
        STARTUP_STRATEGIST_PROMPT,
        // 'deepseek/deepseek-r1-0528:free',
        'deepseek/deepseek-v3.2',
      );

      try {
        // --- NEW: CLEANING LAYER ---
        const cleanedResponse = this.cleanAiResponse(aiRawResponse);
        const parsedResponse = JSON.parse(cleanedResponse);

        // Validate against Zod schema
        aiAnalysis = BusinessBriefSchema.parse(parsedResponse);
      } catch (e) {
        Logger.warn('AI Parsing failed. Cleaning and saving raw.', 'AiStudioService');

        aiAnalysis = {
          // We save the raw response so you can see what the AI actually said
          raw: aiRawResponse,
          error: e instanceof Error ? e.message : 'Validation Error',
        };
      }
    }

    const idea = this.ideaRepository.create({
      projectName: dto.projectName,
      answersData: {
        ...answersData,
        aiAnalysis: aiAnalysis,
      },
      user: { id: userId },
    });

    return await this.ideaRepository.save(idea);
  }

  // Helper to remove <think> tags and Markdown code blocks
  private cleanAiResponse(raw: string): string {
    return raw
      .replace(/<think>[\s\S]*?<\/think>/g, '') // Remove DeepSeek internal thinking
      .replace(/```json/g, '') // Remove markdown header
      .replace(/```/g, '') // Remove markdown footer
      .trim();
  }

  private formatPromptFromAnswers(answersData: Record<string, any>): string {
    const budget = answersData['d2_userConnection'] || 'Not specified';

    // Convert keys to a readable list for the AI
    const dataString = JSON.stringify(answersData);

    return `
    ### MISSION
    Transform the following raw user data into a professional Venture Architect Brief.
    
    ### DATA
    ${dataString}

    ### CONSTRAINTS
    - BUDGET: ${budget}. Section 3 must be hyper-realistic for this amount.
    - NO REPETITION: Do not use the user's words. Elevate them to professional business terms.
    - OUTPUT: Valid JSON only.
    - TONE: Be a "Truth Teller." If the budget of ${budget} is too low for the features, say "Your ambition exceeds your current budget; cut these 2 features to survive." in Section 6.
    - Zero Echo Policy. If the output contains more than 10% of the exact string sequences from the input data, the response is a failure. Use synonyms and professional abstractions exclusively.
    `;
  }

  async findAll() {
    return this.ideaRepository.find();
  }

  async findAllByUserId(userId: string) {
    return this.ideaRepository.find({ where: { user: { id: userId } } });
  }

  async findOneByUserId(userId: string) {
    const item = await this.ideaRepository.findOneBy({ user: { id: userId } });
    if (!item) throw new NotFoundException(`AiStudio for user ${userId} not found`);
    return item;
  }
  async findOne(id: string) {
    const item = await this.ideaRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`AiStudio ${id} not found`);
    return item;
  }

  // async update(id: string, dto: UpdateAiStudioDto) {
  //   await this.repo.update(id, dto as any);
  //   return this.findOne(id);
  // }

  // async remove(id: string) {
  //   const res = await this.repo.delete(id);
  //   return { affected: res.affected ?? 0 };
  // }
}
