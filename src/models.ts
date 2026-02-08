/**
 * Represents the usage stats for a single category (overall, onDemand, pooled).
 */
export interface UsageBucket {
    enabled: boolean;
    used: number;
    limit: number;
    remaining: number;
  }
  
  /**
   * Represents the individual usage section of the usage-summary response.
   */
  export interface IndividualUsage {
    overall: UsageBucket;
    plan: UsageBucket;
    onDemand: UsageBucket;
  }
  
  /**
   * Represents the team usage section of the usage-summary response.
   */
  export interface TeamUsage {
    onDemand: UsageBucket;
    pooled: UsageBucket;
  }
  
  /**
   * Full response from https://cursor.com/api/usage-summary
   */
  export interface UsageSummaryResponse {
    billingCycleStart: string;
    billingCycleEnd: string;
    membershipType: string;
    limitType: string;
    isUnlimited: boolean;
    autoModelSelectedDisplayMessage: string;
    namedModelSelectedDisplayMessage: string;
    individualUsage: IndividualUsage;
    teamUsage?: TeamUsage;
  }
  
  