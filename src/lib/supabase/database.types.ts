/**
 * Types de la base Supabase.
 *
 * Écrits à la main pour rester lisibles ; ils peuvent être régénérés avec :
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 */

import type { ProposalStatus, ProposalType } from '@/lib/domain/proposal';
import type { Theme } from '@/lib/domain/themes';

export type UserRow = {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'gold';
  /** Accès total au tableau de bord /admin. Attribué manuellement en base. */
  is_super_admin: boolean;
  created_at: string;
};

export type ProposalRow = {
  id: string;
  creator_id: string;
  recipient_name: string;
  type: ProposalType;
  message: string | null;
  photo_url: string | null;
  theme: Theme;
  slug: string;
  status: ProposalStatus;
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/** Proposition complète telle que consommée par le parcours destinataire. */
export type FullProposal = ProposalRow & {
  locations: ProposalLocationRow[];
  slots: ProposalSlotRow[];
  response: ResponseRow | null;
};
