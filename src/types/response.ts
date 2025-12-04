// Stakeholder Response Schema
// Based on DATA-SCHEMAS.md

export interface StakeholderResponse {
  stakeholderId: string;
  stakeholderName: string;

  initialReaction: string;              // 2-3 sentence overview

  appreciation: string[];               // Positive aspects (2-4 points)

  concerns: Concern[];                  // Concerns raised (2-4 points)

  questions: string[];                  // Questions they would ask (3-5)

  engagementAdvice: string[];           // Tips for engaging this stakeholder (2-3)

  generatedAt: string;                  // ISO 8601 timestamp
  generationType: 'rule-based' | 'ai-enhanced';
}

export interface Concern {
  text: string;                         // The concern statement
  explanation: string;                  // Why this matters to them
  metric: string;                       // Which metric triggered it
  severity: 'low' | 'medium' | 'high';  // How significant
}
