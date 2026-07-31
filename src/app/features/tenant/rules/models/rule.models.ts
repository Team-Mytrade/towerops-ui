import { QueryParams } from '../../../../core/api/api-query.types';

export type RuleCategory = 'CONDITION';
export type RuleScope = 'GLOBAL' | 'TENANT' | 'SITE' | 'DEVICE';
export type RuleActionType = 'ALERT';
export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RuleOperator =
  | 'EQ'
  | 'NE'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'CONTAINS';
export type RuleLogicalOperator = 'AND' | 'OR';

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: string;
  logicalOperator: RuleLogicalOperator;
}

export interface RuleDefinition {
  conditions: RuleCondition[];
}

export interface RulePayload {
  ruleCode: string;
  name: string;
  description: string;
  category: RuleCategory;
  scope: RuleScope;
  tenantId: string;
  siteCode: string;
  deviceId: string;
  actionType: RuleActionType;
  actionTarget: string;
  severity: RuleSeverity;
  priority: number;
  enabled: boolean;
  definition: RuleDefinition;
}

export interface Rule extends Omit<RulePayload, 'description'> {
  id: number;
  description?: string;
}

export interface DeviceRuleQuery extends QueryParams {
  tenantId: string;
  siteCode: string;
  deviceId: string;
}
