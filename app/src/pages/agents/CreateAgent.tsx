import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Bot,
  Mic,
  MessageSquare,
  Settings,
  BookOpen,
  Sparkles,
  Play,
  Volume2,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
];

const VOICES = [
  { id: '79a125e8-cd45-4c13-8a67-188112f4c22a', name: 'Sarah', gender: 'female', language: 'en-US' },
  { id: '87b3b5a8-4f2c-4b2c-9e8e-6e8e6e8e6e8e', name: 'Michael', gender: 'male', language: 'en-US' },
  { id: '98c4c6b9-5d3d-5c3d-0f9f-7f9f7f9f7f9f', name: 'Emma', gender: 'female', language: 'en-GB' },
  { id: 'a9d5d7c0-6e4e-6d4e-1a0a-8a0a8a0a8a0a', name: 'James', gender: 'male', language: 'en-GB' },
];

const PROMPT_TEMPLATES = [
  {
    name: 'Customer Support Agent',
    prompt: `You are a friendly customer support agent.

YOUR ROLE:
Help customers with questions about our products, handle returns, and resolve issues.

YOUR PERSONALITY:
Warm, helpful, patient, and professional. Use the customer's name when you know it.

WHAT YOU CAN HELP WITH:
- Product information and pricing
- Order status and tracking
- Returns and exchanges
- Basic troubleshooting

WHAT TO DO IF YOU CAN'T HELP:
If you can't answer something, say: "That's a great question — let me get you connected with the right person."`,
  },
  {
    name: 'Sales / Lead Qualification',
    prompt: `You are a professional sales representative.

YOUR ROLE:
Qualify leads, answer product questions, and schedule demos.

YOUR PERSONALITY:
Enthusiastic, knowledgeable, and persuasive but not pushy.

WHAT YOU CAN HELP WITH:
- Product features and benefits
- Pricing information
- Scheduling demos
- Answering common objections

IMPORTANT:
- Always ask for contact information
- Qualify budget and timeline
- Schedule next steps`,
  },
  {
    name: 'Appointment Booking',
    prompt: `You are an appointment scheduling assistant.

YOUR ROLE:
Help callers book, reschedule, or cancel appointments.

YOUR PERSONALITY:
Efficient, organized, and friendly.

WHAT YOU CAN HELP WITH:
- Booking new appointments
- Rescheduling existing appointments
- Canceling appointments
- Answering scheduling questions

IMPORTANT:
- Confirm date, time, and purpose
- Ask for contact information
- Send confirmation details`,
  },
];

export default function CreateAgent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    agent_type: 'inbound',
    language: 'en-US',
    who_speaks_first: 'agent',
    first_message: "Hi there! Thanks for calling. I'm your AI assistant. How can I help you today?",
    voice_id: VOICES[0].id,
    voice_name: VOICES[0].name,
    system_prompt: PROMPT_TEMPLATES[0].prompt,
    silence_timeout_seconds: 10,
    max_call_duration_seconds: 1800,
    call_transfer_enabled: false,
    call_transfer_number: '',
    call_transfer_trigger: 'human_request',
    call_transfer_keyword: '',
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.createAgent(formData);
      toast.success('Agent created successfully!');
      navigate('/agents');
    } catch (error) {
      toast.error('Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Bot },
    { number: 2, title: 'Voice & Greeting', icon: Mic },
    { number: 3, title: 'Prompt', icon: MessageSquare },
    { number: 4, title: 'Call Behavior', icon: Settings },
    { number: 5, title: 'Knowledge Base', icon: BookOpen },
    { number: 6, title: 'Review', icon: Sparkles },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.voice_id !== '';
      case 3:
        return formData.system_prompt.trim().length >= 10;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/agents')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Agent</h1>
          <p className="text-muted-foreground">Set up your new AI voice agent</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-border mx-2 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <Card>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Let's start with the basics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Sarah — Customer Support"
                  value={formData.name}
                  onChange={(e) => updateForm('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Agent Type *</Label>
                <RadioGroup
                  value={formData.agent_type}
                  onValueChange={(value) => updateForm('agent_type', value)}
                  className="grid grid-cols-3 gap-4"
                >
                  {[
                    { value: 'inbound', label: 'Inbound', desc: 'Handles incoming calls' },
                    { value: 'outbound', label: 'Outbound', desc: 'Makes outgoing calls' },
                    { value: 'both', label: 'Both', desc: 'Handles both types' },
                  ].map((type) => (
                    <div key={type.value}>
                      <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                      <Label
                        htmlFor={type.value}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="font-semibold">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language *</Label>
                <select
                  id="language"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.language}
                  onChange={(e) => updateForm('language', e.target.value)}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Voice & Greeting */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Voice & Greeting</CardTitle>
              <CardDescription>Choose a voice and set up the greeting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select Voice *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {VOICES.map((voice) => (
                    <div
                      key={voice.id}
                      onClick={() => {
                        updateForm('voice_id', voice.id);
                        updateForm('voice_name', voice.name);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        formData.voice_id === voice.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{voice.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {voice.gender} · {voice.language}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Preview voice
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Who Speaks First? *</Label>
                <RadioGroup
                  value={formData.who_speaks_first}
                  onValueChange={(value) => updateForm('who_speaks_first', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agent" id="agent-first" />
                    <Label htmlFor="agent-first">Agent speaks first</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="human" id="human-first" />
                    <Label htmlFor="human-first">Wait for caller</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.who_speaks_first === 'agent' && (
                <div className="space-y-2">
                  <Label htmlFor="first-message">First Message</Label>
                  <Textarea
                    id="first-message"
                    value={formData.first_message}
                    onChange={(e) => updateForm('first_message', e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the first thing your agent will say.
                  </p>
                </div>
              )}
            </CardContent>
          </>
        )}

        {/* Step 3: Prompt */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Agent Instructions</CardTitle>
              <CardDescription>Define your agent's personality and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Prompt Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_TEMPLATES.map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      size="sm"
                      onClick={() => updateForm('system_prompt', template.prompt)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">System Prompt *</Label>
                <Textarea
                  id="prompt"
                  value={formData.system_prompt}
                  onChange={(e) => updateForm('system_prompt', e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formData.system_prompt.split(/\s+/).length} words
                  </span>
                  <span className="text-muted-foreground">
                    Min 10 characters
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> The platform automatically adds voice-optimized behavior rules
                  (natural speech patterns, response length limits, etc.) on top of your prompt.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Call Behavior */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Call Behavior</CardTitle>
              <CardDescription>Configure how your agent handles calls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Silence Timeout: {formData.silence_timeout_seconds}s</Label>
                  <Slider
                    value={[formData.silence_timeout_seconds]}
                    onValueChange={([value]) => updateForm('silence_timeout_seconds', value)}
                    min={5}
                    max={60}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    If the caller is silent for this long, the agent will check in
                  </p>
                </div>

                <div>
                  <Label>Max Call Duration: {formData.max_call_duration_seconds / 60} min</Label>
                  <Slider
                    value={[formData.max_call_duration_seconds]}
                    onValueChange={([value]) => updateForm('max_call_duration_seconds', value)}
                    min={60}
                    max={7200}
                    step={60}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Call ends automatically after this duration
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Call Transfer</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow transferring to a human agent
                    </p>
                  </div>
                  <Switch
                    checked={formData.call_transfer_enabled}
                    onCheckedChange={(checked) => updateForm('call_transfer_enabled', checked)}
                  />
                </div>

                {formData.call_transfer_enabled && (
                  <div className="space-y-4 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label htmlFor="transfer-number">Transfer Number</Label>
                      <Input
                        id="transfer-number"
                        placeholder="+1234567890"
                        value={formData.call_transfer_number}
                        onChange={(e) => updateForm('call_transfer_number', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>When to Transfer</Label>
                      <RadioGroup
                        value={formData.call_transfer_trigger}
                        onValueChange={(value) => updateForm('call_transfer_trigger', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="human_request" id="human-request" />
                          <Label htmlFor="human-request">When caller asks for a human</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="keyword" id="keyword" />
                          <Label htmlFor="keyword">When agent hears a specific keyword</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="both" />
                          <Label htmlFor="both">Both</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.call_transfer_trigger !== 'human_request' && (
                      <div className="space-y-2">
                        <Label htmlFor="transfer-keyword">Transfer Keyword</Label>
                        <Input
                          id="transfer-keyword"
                          placeholder="e.g., supervisor, manager, escalate"
                          value={formData.call_transfer_keyword}
                          onChange={(e) => updateForm('call_transfer_keyword', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5: Knowledge Base */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Assign documents to your agent (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-4">
                  You can upload documents to your knowledge base after creating the agent.
                  These documents will help your agent provide accurate, specific answers.
                </p>
                <p className="text-sm text-muted-foreground">
                  Great for: FAQs, product catalogs, pricing sheets, policies, procedures.
                </p>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <>
            <CardHeader>
              <CardTitle>Review & Create</CardTitle>
              <CardDescription>Review your agent configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Type</span>
                  <Badge>{formData.agent_type}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Language</span>
                  <span className="font-medium">
                    {LANGUAGES.find(l => l.value === formData.language)?.label}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Voice</span>
                  <span className="font-medium">{formData.voice_name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Speaks First</span>
                  <span className="font-medium capitalize">{formData.who_speaks_first}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Silence Timeout</span>
                  <span className="font-medium">{formData.silence_timeout_seconds}s</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Max Duration</span>
                  <span className="font-medium">{formData.max_call_duration_seconds / 60} min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Call Transfer</span>
                  <Badge variant={formData.call_transfer_enabled ? 'default' : 'secondary'}>
                    {formData.call_transfer_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Footer */}
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 6 ? (
            <Button
              onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Agent
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
