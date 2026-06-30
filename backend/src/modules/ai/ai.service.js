import axios from 'axios';
import { env } from '../../config/env.js';
import { HttpError } from '../../common/httpError.js';
import { AiSettingsRepository } from './ai.repository.js';

export class AiService {
  constructor(repository = new AiSettingsRepository()) {
    this.repository = repository;
  }

  async chooseProvider(userId) {
    const userSetting = await this.repository.findByUser(userId, true);
    if (userSetting?.is_enabled && userSetting.apiKey) {
      return {
        provider: userSetting.provider,
        apiKey: userSetting.apiKey,
        baseUrl: userSetting.base_url,
        model: userSetting.model_name,
        source: 'user'
      };
    }
    if (env.systemAi.apiKey) {
      return {
        provider: env.systemAi.provider,
        apiKey: env.systemAi.apiKey,
        baseUrl: env.systemAi.baseUrl,
        model: env.systemAi.model,
        source: 'system'
      };
    }
    return {
      provider: 'ollama',
      baseUrl: env.ollama.baseUrl,
      model: env.ollama.model,
      source: 'local'
    };
  }

  async callOpenAiCompatible(config, messages) {
    const response = await axios.post(
      `${config.baseUrl.replace(/\/$/, '')}/chat/completions`,
      { model: config.model, messages, temperature: 0.35 },
      { headers: { Authorization: `Bearer ${config.apiKey}` }, timeout: 30000 }
    );
    return response.data.choices?.[0]?.message?.content || '';
  }

  async callOllama(config, prompt) {
    const response = await axios.post(
      `${config.baseUrl.replace(/\/$/, '')}/api/generate`,
      { model: config.model, prompt, stream: false },
      { timeout: 30000 }
    );
    return response.data.response || '';
  }

  fallback(feature, input) {
    const lead = {
      summary: 'Results-driven MERN Stack Engineer with strong Node.js backend expertise, clean architecture experience, and a track record of shipping scalable business applications.',
      bullets: 'Improved system reliability and delivery speed by designing maintainable APIs, reusable service layers, and database-backed workflows.',
      project: 'Built a production-ready platform with secure APIs, responsive UI, structured data models, and deployment-friendly Docker configuration.',
      keywords: 'Node.js, Express.js, React.js, MySQL, MongoDB, Redis, Docker, AWS, JWT, RBAC, Clean Architecture, REST APIs, System Design'
    }[feature] || 'Rewrite the text with clearer impact, stronger action verbs, and measurable outcomes.';
    return `${lead}\n\nFallback mode used because no AI provider responded. Original context: ${String(input).slice(0, 300)}`;
  }

  async improve({ userId, resumeId, feature, text, role }) {
    const prompt = `You are an expert resume writer. Feature: ${feature}. Target role: ${role || 'software engineer'}.
Improve the following resume text. Return concise, professional content only:\n\n${text}`;
    const messages = [
      { role: 'system', content: 'You improve resumes for ATS and hiring-manager clarity.' },
      { role: 'user', content: prompt }
    ];
    const provider = await this.chooseProvider(userId);
    let content;

    try {
      if (provider.provider === 'ollama') content = await this.callOllama(provider, prompt);
      else content = await this.callOpenAiCompatible(provider, messages);
    } catch (_error) {
      content = this.fallback(feature, text);
      provider.provider = 'mock-fallback';
    }

    const result = { content, provider: provider.provider, source: provider.source };
    await this.repository.logSuggestion({ userId, resumeId, feature, provider: provider.provider, result });
    return result;
  }

  async saveUserSettings(userId, payload) {
    await this.validateProvider(payload);
    return this.repository.upsert(userId, payload);
  }

  async validateProvider(payload) {
    if (!payload.apiKey) throw new HttpError(422, 'API key is required');
    if (!payload.baseUrl) throw new HttpError(422, 'Base URL is required');
    if (!payload.modelName) throw new HttpError(422, 'Model name is required');

    await this.callOpenAiCompatible(
      {
        apiKey: payload.apiKey,
        baseUrl: payload.baseUrl,
        model: payload.modelName
      },
      [{ role: 'user', content: 'Reply with ok.' }]
    );
  }
}

