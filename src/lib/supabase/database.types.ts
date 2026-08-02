/**
 * Types de la base Supabase.
 *
 * Écrits à la main pour rester lisibles ; ils peuvent être régénérés avec :
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */

import type {
  AnyProposalType,
  ProposalAudience,
  ProposalStatus,
  ResponseStatus,
} from '@/lib/domain/proposal';
import type { Theme } from '@/lib/domain/themes';

export type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'gold';
  /** Accès total au tableau de bord /admin. Attribué manuellement en base. */
  is_super_admin: boolean;
  /** Non nul = compte suspendu : la création d'invitation est refusée. */
  suspended_at: string | null;
  created_at: string;
};

export type AdminAuditLogRow = {
  id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type ProposalRow = {
  id: string;
  creator_id: string;
  recipient_name: string;
  type: AnyProposalType;
  message: string | null;
  photo_url: string | null;
  theme: Theme;
  slug: string;
  status: ProposalStatus;
  audience: ProposalAudience;
  /** Places confirmées pour une invitation de groupe. Nul en individuel. */
  group_capacity: number | null;
  viewed_at: string | null;
  expires_at: string;
  created_at: string;
};

export type ProposalLocationRow = {
  id: string;
  proposal_id: string;
  label: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  position: number;
  created_at: string;
};

export type ProposalSlotRow = {
  id: string;
  proposal_id: string;
  start_time: string;
  end_time: string;
  position: number;
  created_at: string;
};

export type ResponseRow = {
  id: string;
  proposal_id: string;
  chosen_location_id: string | null;
  chosen_slot_id: string | null;
  recipient_note: string | null;
  recipient_email: string | null;
  /** Contre-proposition : renseignée quand aucun créneau offert ne convenait. */
  proposed_start: string | null;
  proposed_end: string | null;
  proposed_location: string | null;
  /** confirmed ou waitlisted. Toujours confirmed hors invitation de groupe. */
  status: ResponseStatus;
  /** Prénom du participant, demandé uniquement en groupe. */
  participant_name: string | null;
  /** Jeton d'auto-annulation, non nul uniquement en groupe. */
  cancel_token: string | null;
  responded_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<UserRow, Pick<UserRow, 'id' | 'email'> & Partial<UserRow>>;
      proposals: Table<
        ProposalRow,
        Omit<ProposalRow, 'id' | 'created_at' | 'viewed_at' | 'status'> &
          Partial<Pick<ProposalRow, 'id' | 'created_at' | 'viewed_at' | 'status'>>
      >;
      proposal_locations: Table<
        ProposalLocationRow,
        Omit<ProposalLocationRow, 'id' | 'created_at'> &
          Partial<Pick<ProposalLocationRow, 'id' | 'created_at'>>
      >;
      proposal_slots: Table<
        ProposalSlotRow,
        Omit<ProposalSlotRow, 'id' | 'created_at'> &
          Partial<Pick<ProposalSlotRow, 'id' | 'created_at'>>
      >;
      responses: Table<
        ResponseRow,
        Omit<ResponseRow, 'id' | 'responded_at'> &
          Partial<Pick<ResponseRow, 'id' | 'responded_at'>>
      >;
      admin_audit_log: Table<
        AdminAuditLogRow,
        Omit<AdminAuditLogRow, 'id' | 'created_at'> &
          Partial<Pick<AdminAuditLogRow, 'id' | 'created_at'>>
      >;
    };
    Views: Record<string, never>;
    Functions: {
      purge_expired_proposals: {
        Args: { grace_days?: number };
        Returns: number;
      };
      count_proposals_this_month: {
        Args: { target_user: string };
        Returns: number;
      };
      admin_get_stats: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      admin_list_creators: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      console_list_proposals: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      console_get_proposal: {
        Args: { p_id: string };
        Returns: unknown;
      };
      console_list_audit: {
        Args: { p_limit?: number };
        Returns: unknown;
      };
      console_system_health: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      console_log_action: {
        Args: {
          p_actor_email: string;
          p_action: string;
          p_target_type?: string | null;
          p_target_id?: string | null;
          p_target_label?: string | null;
          p_details?: Record<string, unknown>;
        };
        Returns: void;
      };
      respond_to_proposal: {
        Args: {
          p_proposal_id: string;
          p_chosen_location_id: string | null;
          p_chosen_slot_id: string | null;
          p_recipient_note: string | null;
          p_recipient_email: string | null;
          p_proposed_start: string | null;
          p_proposed_end: string | null;
          p_proposed_location: string | null;
          p_participant_name: string | null;
        };
        Returns: {
          response_id: string;
          response_status: ResponseStatus;
          response_cancel_token: string | null;
          response_waitlist_position: number | null;
        }[];
      };
      cancel_group_response: {
        Args: { p_response_id: string; p_cancel_token: string };
        Returns: {
          cancelled: boolean;
          promoted_id: string | null;
          promoted_email: string | null;
          promoted_participant_name: string | null;
        }[];
      };
      console_remove_group_response: {
        Args: { p_response_id: string };
        Returns: {
          proposal_id: string | null;
          promoted_id: string | null;
          promoted_email: string | null;
          promoted_participant_name: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/**
 * Proposition complète telle que consommée par le parcours destinataire.
 *
 * `responses` est un tableau — jamais un `response` singulier — car une
 * invitation de groupe en porte potentiellement plusieurs. Pour une
 * invitation individuelle, il en contient au plus une.
 */
export type FullProposal = ProposalRow & {
  locations: ProposalLocationRow[];
  slots: ProposalSlotRow[];
  responses: ResponseRow[];
};
