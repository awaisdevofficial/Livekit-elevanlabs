// API client for Voice Agent Platform

import { User, Agent, PhoneNumber, Call, Campaign, KnowledgeDocument, DashboardStats, CallVolumeData, AgentPerformance } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async register(email: string, password: string, full_name: string) {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getMe() {
    return this.request<User>('/auth/me');
  }

  // Agents
  async getAgents(params?: { agent_type?: string; is_active?: boolean }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<{ items: Agent[]; total: number }>(`/agents?${query}`);
  }

  async getAgent(id: string) {
    return this.request<Agent>(`/agents/${id}`);
  }

  async createAgent(data: Partial<Agent>) {
    return this.request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: Partial<Agent>) {
    return this.request<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string) {
    return this.request<void>(`/agents/${id}`, { method: 'DELETE' });
  }

  async getAgentStats(id: string) {
    return this.request<{
      total_calls: number;
      total_minutes: number;
      avg_duration_seconds: number;
      avg_response_time_ms?: number;
      interruption_rate: number;
    }>(`/agents/${id}/stats`);
  }

  async previewVoice(agentId: string, text: string, voiceId: string) {
    return this.request<{ audio_url: string }>(`/agents/${agentId}/preview-voice`, {
      method: 'POST',
      body: JSON.stringify({ text, voice_id: voiceId }),
    });
  }

  // Phone Numbers
  async getPhoneNumbers() {
    return this.request<PhoneNumber[]>('/phone-numbers');
  }

  async importPhoneNumbers() {
    return this.request<{ message: string; numbers: PhoneNumber[] }>('/phone-numbers/import', {
      method: 'POST',
    });
  }

  async updatePhoneNumber(id: string, data: Partial<PhoneNumber>) {
    return this.request<PhoneNumber>(`/phone-numbers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePhoneNumber(id: string) {
    return this.request<void>(`/phone-numbers/${id}`, { method: 'DELETE' });
  }

  async setupInbound(id: string, agentId: string) {
    return this.request<{ message: string; trunk_id: string; dispatch_rule_id: string }>(
      `/phone-numbers/${id}/setup-inbound`,
      {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      }
    );
  }

  async setupOutbound(id: string, agentId: string) {
    return this.request<{ message: string; trunk_id: string }>(
      `/phone-numbers/${id}/setup-outbound`,
      {
        method: 'POST',
        body: JSON.stringify({ agent_id: agentId }),
      }
    );
  }

  // Calls
  async getCalls(params?: { agent_id?: string; direction?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<Call[]>(`/calls?${query}`);
  }

  async getActiveCalls() {
    return this.request<{ items: Call[]; count: number }>('/calls/active');
  }

  async getCall(id: string) {
    return this.request<Call & { transcripts: Transcript[] }>(`/calls/${id}`);
  }

  async getCallTranscript(id: string) {
    return this.request<{ items: Transcript[] }>(`/calls/${id}/transcript`);
  }

  async initiateOutboundCall(agentId: string, phoneNumberId: string, toNumber: string) {
    return this.request<{ call_id: string; status: string }>('/calls/outbound', {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        phone_number_id: phoneNumberId,
        to_number: toNumber,
      }),
    });
  }

  // Campaigns
  async getCampaigns(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request<{ items: Campaign[]; total: number }>(`/campaigns${query}`);
  }

  async getCampaign(id: string) {
    return this.request<Campaign>(`/campaigns/${id}`);
  }

  async createCampaign(data: Partial<Campaign>) {
    return this.request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: string, data: Partial<Campaign>) {
    return this.request<Campaign>(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string) {
    return this.request<void>(`/campaigns/${id}`, { method: 'DELETE' });
  }

  async startCampaign(id: string) {
    return this.request<{ message: string; task_id: string }>(`/campaigns/${id}/start`, {
      method: 'POST',
    });
  }

  async pauseCampaign(id: string) {
    return this.request<{ message: string }>(`/campaigns/${id}/pause`, { method: 'POST' });
  }

  async resumeCampaign(id: string) {
    return this.request<{ message: string }>(`/campaigns/${id}/resume`, { method: 'POST' });
  }

  async stopCampaign(id: string) {
    return this.request<{ message: string }>(`/campaigns/${id}/stop`, { method: 'POST' });
  }

  async getCampaignContacts(id: string, page?: number, limit?: number) {
    const query = new URLSearchParams({ page: String(page || 1), limit: String(limit || 50) }).toString();
    return this.request<{ items: CampaignContact[]; page: number; limit: number }>(
      `/campaigns/${id}/contacts?${query}`
    );
  }

  async getCampaignStats(id: string) {
    return this.request<{
      total_contacts: number;
      pending: number;
      calling: number;
      answered: number;
      completed: number;
      no_answer: number;
      failed: number;
      voicemail: number;
      progress_percentage: number;
    }>(`/campaigns/${id}/stats`);
  }

  // Knowledge Base
  async getDocuments(params?: { agent_id?: string; status?: string }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<{ items: KnowledgeDocument[]; total: number }>(`/knowledge-base?${query}`);
  }

  async uploadDocument(file: File, agentId?: string, description?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (agentId) formData.append('agent_id', agentId);
    if (description) formData.append('description', description);

    return this.request<KnowledgeDocument>('/knowledge-base/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string) {
    return this.request<void>(`/knowledge-base/${id}`, { method: 'DELETE' });
  }

  async retryDocumentProcessing(id: string) {
    return this.request<{ message: string }>(`/knowledge-base/${id}/retry`, { method: 'POST' });
  }

  // Dashboard
  async getDashboardStats() {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getCallVolume(days?: number) {
    const query = days ? `?days=${days}` : '';
    return this.request<{ data: CallVolumeData[] }>(`/dashboard/call-volume${query}`);
  }

  async getAgentPerformance() {
    return this.request<{ data: AgentPerformance[] }>('/dashboard/agent-performance');
  }

  // Settings
  async getSettings() {
    return this.request<{
      twilio_validated: boolean;
      twilio_validated_at?: string;
      livekit_validated: boolean;
      livekit_validated_at?: string;
      twilio_account_sid?: string;
      twilio_sip_domain?: string;
      livekit_ws_url?: string;
      livekit_sip_uri?: string;
    }>('/settings');
  }

  async updateTwilioCredentials(accountSid: string, authToken: string) {
    return this.request<{ message: string; validated: boolean }>('/settings/twilio', {
      method: 'PUT',
      body: JSON.stringify({ account_sid: accountSid, auth_token: authToken }),
    });
  }

  async updateTwilioSIPConfig(sipDomain: string, sipUsername: string, sipPassword: string) {
    return this.request<{ message: string }>('/settings/twilio/sip', {
      method: 'PUT',
      body: JSON.stringify({
        sip_domain: sipDomain,
        sip_username: sipUsername,
        sip_password: sipPassword,
      }),
    });
  }

  async updateLiveKitConfig(wsUrl: string, apiKey: string, apiSecret: string, sipUri: string) {
    return this.request<{ message: string; validated: boolean }>('/settings/livekit', {
      method: 'PUT',
      body: JSON.stringify({
        ws_url: wsUrl,
        api_key: apiKey,
        api_secret: apiSecret,
        sip_uri: sipUri,
      }),
    });
  }

  async getVoices() {
    return this.request<{ voices: { id: string; name: string; gender: string; language: string }[] }>(
      '/settings/livekit/voices'
    );
  }
}

export const api = new ApiClient(API_URL);
