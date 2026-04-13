
export interface Message {
  sender: 'user' | 'agent';
  text: string;
}

export interface ExtractedIntelligence {
  bank_accounts: string[];
  upi_ids: string[];
  phishing_links: string[];
  names: string[];
  phone_numbers: string[];
}

export enum ScamStatus {
    NOT_DETECTED = "NOT_DETECTED",
    MONITORING = "MONITORING",
    SCAM_CONFIRMED = "SCAM_CONFIRMED",
}

export interface AnalysisResult {
  scam_status: ScamStatus;
  scam_score: number;
  reasoning: string;
  extracted_intelligence: ExtractedIntelligence;
}

export interface AgentResponse {
    reply: string;
    analysis: AnalysisResult;
}
