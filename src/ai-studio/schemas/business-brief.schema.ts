import { z } from 'zod';

export const BusinessBriefSchema = z.object({
  strategic_elevation: z.object({
    elevator_pitch: z.string(),
    unique_value_proposition: z.string(),
    competitive_moat: z.string(),
  }),
  market_landscape: z.object({
    target_persona: z.string(),
    competitors: z.array(
      z.object({
        name: z.string(),
        weakness: z.string(),
        your_edge: z.string(),
      }),
    ),
  }),
  technical_blueprint: z.object({
    frontend_stack: z.string(),
    backend_infra: z.string(),
    ai_logic: z.string(),
  }),
  resource_blueprint: z.object({
    lean_team_roles: z.array(z.string()),
    budget_breakdown_sar: z.string(),
    hiring_platform: z.string(),
  }),
  execution_roadmap: z.object({
    phase_1_validation: z.string(),
    phase_2_mvp_build: z.string(),
    phase_3_growth: z.string(),
  }),
  expert_consultation: z.object({
    primary_risk: z.string(),
    immediate_next_steps: z.array(z.string()),
  }),
});
