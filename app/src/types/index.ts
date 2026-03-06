export interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  firstMessage: string;
  voice: string;
  language: string;
  silenceTimeout: number;
  maxDuration: number;
  status: 'active' | 'inactive';
  callCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Call {
  id: string;
  agentId: string;
  agentName: string;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string;
  duration: number;
  status: 'completed' | 'failed' | 'in-progress';
  startedAt: Date;
  endedAt?: Date;
  transcript?: TranscriptMessage[];
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

export interface TranscriptMessage {
  speaker: 'agent' | 'user';
  text: string;
  timestamp: Date;
}

export interface KnowledgeEntry {
  id: string;
  name: string;
  content: string;
  agentId?: string;
  agentName?: string;
  createdAt: Date;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastTriggered?: Date;
  lastStatusCode?: number;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  avatar?: string;
}

export interface MetricData {
  label: string;
  value: number;
  change?: number;
  icon: string;
}

export interface ChartData {
  date: string;
  calls: number;
  duration: number;
}

export interface PhoneNumber {
  id: string;
  number: string;
  agentId?: string;
  isPrimary: boolean;
  provider: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
}
