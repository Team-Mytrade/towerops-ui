import { QueryParams } from "../../../../core/api/api-query.types";

export type RuleCategory =
  | 'CONDITION'
  | 'REGEX'
  | 'THRESHOLD'
  | 'RANGE'
  | 'STATE_CHANGE'
  | 'ABSENCE'
  | 'AGGREGATION'
  | 'SCHEDULE'
  | 'GEO_FENCE'
  | 'DUPLICATE'
  | 'SCRIPT';

export type RuleScope = 'GLOBAL' | 'TENANT' | 'SITE' | 'DEVICE';
export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleActionType = 'ALERT' | 'TICKET' | 'NOTIFICATION';
export type RuleOperator = 'EQ' | 'NE' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'CONTAINS';
export type LogicalOperator = 'AND' | 'OR';

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: string;
  logicalOperator?: LogicalOperator;
}

export type RuleDefinition =
  | { conditions: RuleCondition[] }
  | { field: string; pattern: string }
  | { field: string; operator: RuleOperator; threshold: number; duration: string }
  | { field: string; minValue: number; maxValue: number }
  | { field: string; fromValue: string; toValue: string }
  | { field: string; duration: string }
  | {
      aggregationType: 'AVG' | 'SUM' | 'MIN' | 'MAX' | 'COUNT';
      field: string;
      window: string;
      operator: RuleOperator;
      value: number;
    }
  | { cronExpression: string }
  | {
      latitude: number;
      longitude: number;
      radiusMeters: number;
      event: 'ENTER' | 'EXIT';
    }
  | { field: string; window: string }
  | { language: 'javascript'; expression: string };

export interface RulePayload {
  ruleCode: string;
  name: string;
  description: string;
  category: RuleCategory;
  scope: RuleScope;
  tenantId: string;
  siteCode: string | null;
  deviceId: string | null;
  actionType: RuleActionType;
  actionTarget: string;
  severity: RuleSeverity;
  priority: number;
  enabled: boolean;
  definition: RuleDefinition;
}

export interface Rule extends RulePayload {
  id: number;
}
export interface DeviceRuleQuery extends QueryParams {
  tenantId: string;
  siteCode: string;
  deviceId: string;
}
