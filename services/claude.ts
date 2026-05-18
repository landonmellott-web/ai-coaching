import Anthropic from '@anthropic-ai/sdk';
import { CoachContext, ChatMessage, Goal } from '../types';

const getClient = () => {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured. Please set EXPO_PUBLIC_ANTHROPIC_API_KEY in your .env file.');
  }
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
};

const COACH_SYSTEM_PROMPT = `You are Coach Maya, a warm, empathetic, and highly skilled professional life coach. You have expertise in positive psychology, goal-setting (OKRs, SMART goals), cognitive behavioral coaching, and mindfulness.

Your coaching style:
- Warm and encouraging, but honest and direct when needed
- Ask powerful, open-ended questions that spark self-reflection
- Give concrete, actionable advice tailored to the person's specific situation
- Celebrate progress and wins, no matter how small
- Help reframe challenges as opportunities for growth
- Reference the user's goals and focus areas to personalize your guidance
- Use the user's name naturally in conversation

Response guidelines:
- Keep responses concise: 2-4 sentences maximum (this is a mobile app)
- Never use bullet points or numbered lists in responses
- Speak conversationally, like a trusted friend who happens to be an expert
- End with either an actionable suggestion OR a powerful question — never both
- Never be preachy or lecture. Coach, don't teach.
- If the user seems distressed, lead with empathy before advice

You remember their goals, streak, and focus areas. Use this context to make every response feel personal and relevant.`;

function buildContextString(context: CoachContext): string {
  const parts: string[] = [];

  if (context.userName) {
    parts.push(`User's name: ${context.userName}`);
  }

  if (context.focusAreas && context.focusAreas.length > 0) {
    parts.push(`Focus areas: ${context.focusAreas.join(', ')}`);
  }

  if (context.goals && context.goals.length > 0) {
    const activeGoals = context.goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
      const goalSummaries = activeGoals
        .map(g => `"${g.title}" (${g.progress}% complete)`)
        .join(', ');
      parts.push(`Active goals: ${goalSummaries}`);
    }
  }

  if (context.streak > 0) {
    parts.push(`Current check-in streak: ${context.streak} days`);
  }

  return parts.length > 0 ? `\n\nUser context:\n${parts.join('\n')}` : '';
}

function buildMessageHistory(
  chatHistory: ChatMessage[],
  newMessage: string,
  context: CoachContext
): Anthropic.MessageParam[] {
  // Use last 20 messages for context window efficiency
  const recentHistory = chatHistory.slice(-20);

  const messages: Anthropic.MessageParam[] = recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));

  messages.push({
    role: 'user',
    content: newMessage,
  });

  return messages;
}

export async function getCoachingResponse(
  userMessage: string,
  context: CoachContext
): Promise<string> {
  const client = getClient();
  const contextString = buildContextString(context);
  const systemPromptWithContext = COACH_SYSTEM_PROMPT + contextString;
  const messages = buildMessageHistory(context.chatHistory, userMessage, context);

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemPromptWithContext,
    messages,
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  return content.text.trim();
}

export async function getDailyInsight(
  userName: string,
  goals: Goal[],
  streak: number
): Promise<string> {
  const client = getClient();

  const activeGoals = goals.filter(g => g.status === 'active');
  const goalContext = activeGoals.length > 0
    ? `They are working on: ${activeGoals.map(g => g.title).join(', ')}.`
    : 'They are just getting started on their coaching journey.';

  const streakContext = streak > 0
    ? `They have a ${streak}-day streak going.`
    : 'They are starting fresh today.';

  const timeOfDay = new Date().getHours();
  let timeGreeting = 'today';
  if (timeOfDay < 12) timeGreeting = 'this morning';
  else if (timeOfDay < 17) timeGreeting = 'this afternoon';
  else timeGreeting = 'this evening';

  const prompt = `Generate a single, powerful daily coaching insight for ${userName} ${timeGreeting}. ${goalContext} ${streakContext}

The insight should be:
- Motivating and actionable (one concrete thing they can do today)
- Personalized to feel like it's just for them
- 2-3 sentences maximum
- Warm and encouraging in tone
- NOT generic advice — make it feel fresh and specific

Respond with ONLY the insight text, no preamble or labels.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  return content.text.trim();
}

export async function getGoalSuggestion(focusAreas: string[]): Promise<string> {
  const client = getClient();

  const prompt = `Suggest one specific, achievable goal for someone focused on: ${focusAreas.join(', ')}.
Make it concrete and measurable. Respond with ONLY the goal title (5-10 words max), nothing else.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 50,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  return content.text.trim();
}
