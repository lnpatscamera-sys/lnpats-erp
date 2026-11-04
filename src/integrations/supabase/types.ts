export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appointment_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          justification: string | null
          officer_id: string
          post_id: string
          requested_by: string
          roles: Database["public"]["Enums"]["app_role"][]
          status: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          justification?: string | null
          officer_id: string
          post_id: string
          requested_by?: string
          roles?: Database["public"]["Enums"]["app_role"][]
          status?: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          justification?: string | null
          officer_id?: string
          post_id?: string
          requested_by?: string
          roles?: Database["public"]["Enums"]["app_role"][]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "appointment_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "appointment_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_requests_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "establishment_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          assessment_id: string
          cadet_id: string
          created_at: string
          grade: string | null
          id: string
          remarks: string | null
          score: number
        }
        Insert: {
          assessment_id: string
          cadet_id: string
          created_at?: string
          grade?: string | null
          id?: string
          remarks?: string | null
          score: number
        }
        Update: {
          assessment_id?: string
          cadet_id?: string
          created_at?: string
          grade?: string | null
          id?: string
          remarks?: string | null
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_cadet_id_fkey"
            columns: ["cadet_id"]
            isOneToOne: false
            referencedRelation: "cadets"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          course_id: string
          created_at: string
          exam_code: string | null
          exam_date: string
          id: string
          max_score: number
          passing_score: number
          results_published: boolean
          subject: string
        }
        Insert: {
          assessment_type: string
          course_id: string
          created_at?: string
          exam_code?: string | null
          exam_date: string
          id?: string
          max_score?: number
          passing_score?: number
          results_published?: boolean
          subject: string
        }
        Update: {
          assessment_type?: string
          course_id?: string
          created_at?: string
          exam_code?: string | null
          exam_date?: string
          id?: string
          max_score?: number
          passing_score?: number
          results_published?: boolean
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          asset_id: string | null
          assigned_by: string | null
          assigned_date: string | null
          created_at: string
          id: string
          officer_id: string | null
          remarks: string | null
          returned_date: string | null
          section_id: string | null
        }
        Insert: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string
          id?: string
          officer_id?: string | null
          remarks?: string | null
          returned_date?: string | null
          section_id?: string | null
        }
        Update: {
          asset_id?: string | null
          assigned_by?: string | null
          assigned_date?: string | null
          created_at?: string
          id?: string
          officer_id?: string | null
          remarks?: string | null
          returned_date?: string | null
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_assignments_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_maintenance: {
        Row: {
          action_taken: string | null
          asset_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          findings: string | null
          id: string
          maintenance_date: string | null
          maintenance_number: string | null
          maintenance_type: string | null
          next_service_date: string | null
          recorded_by: string | null
          status: string
          supplier_id: string | null
          technician_id: string | null
        }
        Insert: {
          action_taken?: string | null
          asset_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          findings?: string | null
          id?: string
          maintenance_date?: string | null
          maintenance_number?: string | null
          maintenance_type?: string | null
          next_service_date?: string | null
          recorded_by?: string | null
          status?: string
          supplier_id?: string | null
          technician_id?: string | null
        }
        Update: {
          action_taken?: string | null
          asset_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          findings?: string | null
          id?: string
          maintenance_date?: string | null
          maintenance_number?: string | null
          maintenance_type?: string | null
          next_service_date?: string | null
          recorded_by?: string | null
          status?: string
          supplier_id?: string | null
          technician_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_maintenance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_maintenance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_maintenance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_maintenance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_maintenance_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_transfers: {
        Row: {
          asset_id: string | null
          created_at: string
          from_officer_id: string | null
          from_section_id: string | null
          id: string
          reason: string | null
          recorded_by: string | null
          to_officer_id: string | null
          to_section_id: string | null
          transfer_date: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          from_officer_id?: string | null
          from_section_id?: string | null
          id?: string
          reason?: string | null
          recorded_by?: string | null
          to_officer_id?: string | null
          to_section_id?: string | null
          transfer_date?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          from_officer_id?: string | null
          from_section_id?: string | null
          id?: string
          reason?: string | null
          recorded_by?: string | null
          to_officer_id?: string | null
          to_section_id?: string | null
          transfer_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_transfers_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_from_officer_id_fkey"
            columns: ["from_officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_transfers_from_officer_id_fkey"
            columns: ["from_officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_from_officer_id_fkey"
            columns: ["from_officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_transfers_from_officer_id_fkey"
            columns: ["from_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_from_section_id_fkey"
            columns: ["from_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_transfers_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_transfers_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_to_officer_id_fkey"
            columns: ["to_officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "asset_transfers_to_officer_id_fkey"
            columns: ["to_officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_to_officer_id_fkey"
            columns: ["to_officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "asset_transfers_to_officer_id_fkey"
            columns: ["to_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_transfers_to_section_id_fkey"
            columns: ["to_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_name: string | null
          asset_number: string | null
          asset_status: string
          assigned_to: string | null
          brand: string | null
          category: string | null
          condition: string | null
          department_id: string | null
          ict_managed: boolean
          id: string
          model: string | null
          purchase_date: string | null
          section_id: string | null
          serial_number: string | null
          value: number | null
          warranty_expiry: string | null
        }
        Insert: {
          asset_name?: string | null
          asset_number?: string | null
          asset_status?: string
          assigned_to?: string | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          department_id?: string | null
          ict_managed?: boolean
          id?: string
          model?: string | null
          purchase_date?: string | null
          section_id?: string | null
          serial_number?: string | null
          value?: number | null
          warranty_expiry?: string | null
        }
        Update: {
          asset_name?: string | null
          asset_number?: string | null
          asset_status?: string
          assigned_to?: string | null
          brand?: string | null
          category?: string | null
          condition?: string | null
          department_id?: string | null
          ict_managed?: boolean
          id?: string
          model?: string | null
          purchase_date?: string | null
          section_id?: string | null
          serial_number?: string | null
          value?: number | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "assets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          details: Json
          id: string
          method: string
          officer_id: string | null
          recorded_by: string | null
          remarks: string | null
          status: string | null
        }
        Insert: {
          attendance_date?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          details?: Json
          id?: string
          method?: string
          officer_id?: string | null
          recorded_by?: string | null
          remarks?: string | null
          status?: string | null
        }
        Update: {
          attendance_date?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          details?: Json
          id?: string
          method?: string
          officer_id?: string | null
          recorded_by?: string | null
          remarks?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "attendance_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_devices: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          ip_address: string | null
          last_seen_at: string | null
          last_sync_at: string | null
          location: string | null
          model: string
          name: string
          offline_alerted: boolean
          port: number
          serial_number: string | null
          status: string
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          last_sync_at?: string | null
          location?: string | null
          model?: string
          name: string
          offline_alerted?: boolean
          port?: number
          serial_number?: string | null
          status?: string
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          ip_address?: string | null
          last_seen_at?: string | null
          last_sync_at?: string | null
          location?: string | null
          model?: string
          name?: string
          offline_alerted?: boolean
          port?: number
          serial_number?: string | null
          status?: string
          token_hash?: string
        }
        Relationships: []
      }
      attendance_punches: {
        Row: {
          biometric_user_id: string | null
          created_at: string
          device_id: string
          direction: string
          event_key: string
          id: string
          method: string
          officer_id: string | null
          punched_at: string
          raw: Json | null
        }
        Insert: {
          biometric_user_id?: string | null
          created_at?: string
          device_id: string
          direction?: string
          event_key: string
          id?: string
          method?: string
          officer_id?: string | null
          punched_at: string
          raw?: Json | null
        }
        Update: {
          biometric_user_id?: string | null
          created_at?: string
          device_id?: string
          direction?: string
          event_key?: string
          id?: string
          method?: string
          officer_id?: string | null
          punched_at?: string
          raw?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_punches_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "attendance_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_punches_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "attendance_punches_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_punches_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "attendance_punches_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          attendance_date: string
          cadet_id: string
          course_id: string
          created_at: string
          id: string
          recorded_by: string | null
          remarks: string | null
          status: string
        }
        Insert: {
          attendance_date?: string
          cadet_id: string
          course_id: string
          created_at?: string
          id?: string
          recorded_by?: string | null
          remarks?: string | null
          status: string
        }
        Update: {
          attendance_date?: string
          cadet_id?: string
          course_id?: string
          created_at?: string
          id?: string
          recorded_by?: string | null
          remarks?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_cadet_id_fkey"
            columns: ["cadet_id"]
            isOneToOne: false
            referencedRelation: "cadets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sync_logs: {
        Row: {
          created_at: string
          detail: string | null
          device_id: string | null
          event: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          device_id?: string | null
          event: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          device_id?: string | null
          event?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sync_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "attendance_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: number
          ip_address: string | null
          previous_details: Json | null
          record_id: string | null
          table_name: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: never
          ip_address?: string | null
          previous_details?: Json | null
          record_id?: string | null
          table_name: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: never
          ip_address?: string | null
          previous_details?: Json | null
          record_id?: string | null
          table_name?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      biometric_users: {
        Row: {
          biometric_user_id: string
          created_at: string
          created_by: string | null
          id: string
          officer_id: string
        }
        Insert: {
          biometric_user_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          officer_id: string
        }
        Update: {
          biometric_user_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          officer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_users_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "biometric_users_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_users_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "biometric_users_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: true
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_allocations: {
        Row: {
          amount: number
          budget_id: string
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          section_id: string | null
        }
        Insert: {
          amount: number
          budget_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          section_id?: string | null
        }
        Update: {
          amount?: number
          budget_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          allocated_amount: number | null
          budget_number: string | null
          category: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          fiscal_year: number | null
          funding_source: string | null
          history: Json
          id: string
          remaining_amount: number | null
          requested_amount: number
          status: string
          used_amount: number | null
        }
        Insert: {
          allocated_amount?: number | null
          budget_number?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          fiscal_year?: number | null
          funding_source?: string | null
          history?: Json
          id?: string
          remaining_amount?: number | null
          requested_amount?: number
          status?: string
          used_amount?: number | null
        }
        Update: {
          allocated_amount?: number | null
          budget_number?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          fiscal_year?: number | null
          funding_source?: string | null
          history?: Json
          id?: string
          remaining_amount?: number | null
          requested_amount?: number
          status?: string
          used_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_department_fkey"
            columns: ["department"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      cadets: {
        Row: {
          address: string | null
          cadet_number: string | null
          date_enrolled: string | null
          date_of_birth: string | null
          documents: Json
          email: string | null
          emergency_contact: string | null
          first_name: string | null
          gender: string | null
          id: string
          intake_number: string | null
          last_name: string | null
          nationality: string | null
          phone: string | null
          program_id: string | null
          rank_before_admission: string | null
          recruitment_date: string | null
          sponsoring_unit: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          cadet_number?: string | null
          date_enrolled?: string | null
          date_of_birth?: string | null
          documents?: Json
          email?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          intake_number?: string | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          program_id?: string | null
          rank_before_admission?: string | null
          recruitment_date?: string | null
          sponsoring_unit?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          cadet_number?: string | null
          date_enrolled?: string | null
          date_of_birth?: string | null
          documents?: Json
          email?: string | null
          emergency_contact?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          intake_number?: string | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          program_id?: string | null
          rank_before_admission?: string | null
          recruitment_date?: string | null
          sponsoring_unit?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadets_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_requests: {
        Row: {
          amount: number
          created_at: string
          date_required: string | null
          history: Json
          id: string
          justification: string | null
          officer_id: string | null
          purpose: string
          request_number: string | null
          requested_by: string
          section_id: string | null
          stage: number
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          date_required?: string | null
          history?: Json
          id?: string
          justification?: string | null
          officer_id?: string | null
          purpose: string
          request_number?: string | null
          requested_by?: string
          section_id?: string | null
          stage?: number
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date_required?: string | null
          history?: Json
          id?: string
          justification?: string | null
          officer_id?: string | null
          purpose?: string
          request_number?: string | null
          requested_by?: string
          section_id?: string | null
          stage?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "cash_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "cash_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_requests_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          cadet_id: string
          certificate_number: string
          completion_date: string
          created_at: string
          graduation_id: string | null
          id: string
          program_id: string | null
          signed_by: string | null
          verification_code: string
        }
        Insert: {
          cadet_id: string
          certificate_number: string
          completion_date?: string
          created_at?: string
          graduation_id?: string | null
          id?: string
          program_id?: string | null
          signed_by?: string | null
          verification_code?: string
        }
        Update: {
          cadet_id?: string
          certificate_number?: string
          completion_date?: string
          created_at?: string
          graduation_id?: string | null
          id?: string
          program_id?: string | null
          signed_by?: string | null
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_cadet_id_fkey"
            columns: ["cadet_id"]
            isOneToOne: false
            referencedRelation: "cadets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_graduation_id_fkey"
            columns: ["graduation_id"]
            isOneToOne: false
            referencedRelation: "graduations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      compiled_reports: {
        Row: {
          comments: string | null
          created_at: string
          created_by: string
          end_date: string
          history: Json
          id: string
          period: string
          recipient_id: string | null
          remarks: string | null
          report_number: string
          signature: string
          signed_at: string | null
          source_ids: string[]
          source_snapshots: Json
          start_date: string
          statistics: Json | null
          status: string
          summary: string | null
          title: string
        }
        Insert: {
          comments?: string | null
          created_at?: string
          created_by: string
          end_date: string
          history?: Json
          id?: string
          period: string
          recipient_id?: string | null
          remarks?: string | null
          report_number?: string
          signature: string
          signed_at?: string | null
          source_ids: string[]
          source_snapshots: Json
          start_date: string
          statistics?: Json | null
          status?: string
          summary?: string | null
          title: string
        }
        Update: {
          comments?: string | null
          created_at?: string
          created_by?: string
          end_date?: string
          history?: Json
          id?: string
          period?: string
          recipient_id?: string | null
          remarks?: string | null
          report_number?: string
          signature?: string
          signed_at?: string | null
          source_ids?: string[]
          source_snapshots?: Json
          start_date?: string
          statistics?: Json | null
          status?: string
          summary?: string | null
          title?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          attachments: Json
          contract_number: string | null
          contract_value: number
          created_at: string
          created_by: string | null
          end_date: string
          history: Json
          id: string
          manager_id: string | null
          po_id: string | null
          renewal_count: number
          start_date: string
          status: string
          title: string
          vendor_id: string
        }
        Insert: {
          attachments?: Json
          contract_number?: string | null
          contract_value: number
          created_at?: string
          created_by?: string | null
          end_date: string
          history?: Json
          id?: string
          manager_id?: string | null
          po_id?: string | null
          renewal_count?: number
          start_date: string
          status?: string
          title: string
          vendor_id: string
        }
        Update: {
          attachments?: Json
          contract_number?: string | null
          contract_value?: number
          created_at?: string
          created_by?: string | null
          end_date?: string
          history?: Json
          id?: string
          manager_id?: string | null
          po_id?: string | null
          renewal_count?: number
          start_date?: string
          status?: string
          title?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "contracts_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "contracts_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      correspondence: {
        Row: {
          action_taken: string | null
          attachments: Json
          created_at: string
          created_by: string
          direction: string
          history: Json
          id: string
          keywords: string | null
          office_id: string | null
          officer_id: string | null
          party: string
          record_date: string
          reference_number: string
          stage: number
          status: string
          subject: string
        }
        Insert: {
          action_taken?: string | null
          attachments?: Json
          created_at?: string
          created_by: string
          direction: string
          history?: Json
          id?: string
          keywords?: string | null
          office_id?: string | null
          officer_id?: string | null
          party: string
          record_date?: string
          reference_number: string
          stage?: number
          status?: string
          subject: string
        }
        Update: {
          action_taken?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string
          direction?: string
          history?: Json
          id?: string
          keywords?: string | null
          office_id?: string | null
          officer_id?: string | null
          party?: string
          record_date?: string
          reference_number?: string
          stage?: number
          status?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "correspondence_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "correspondence_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "correspondence_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "correspondence_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_lesson_plans: {
        Row: {
          content: string
          course_id: string
          created_at: string
          created_by: string
          id: string
          lesson_date: string
          objectives: string
          title: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          created_by?: string
          id?: string
          lesson_date: string
          objectives: string
          title: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          created_by?: string
          id?: string
          lesson_date?: string
          objectives?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_lesson_plans_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string
          created_at: string
          created_by: string
          file_path: string
          id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string
          file_path: string
          id?: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          file_path?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          course_id: string
          created_at: string
          created_by: string
          ends_at: string
          id: string
          location: string
          starts_at: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string
          ends_at: string
          id?: string
          location: string
          starts_at: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string
          id?: string
          location?: string
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_code: string | null
          course_name: string | null
          description: string | null
          duration: number | null
          id: string
          instructor_id: string | null
          training_program_id: string | null
        }
        Insert: {
          course_code?: string | null
          course_name?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          instructor_id?: string | null
          training_program_id?: string | null
        }
        Update: {
          course_code?: string | null
          course_name?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          instructor_id?: string | null
          training_program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_training_program_id_fkey"
            columns: ["training_program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          activities: string
          attachments: Json
          chain: Json
          challenges: string | null
          created_at: string
          created_by: string
          duty_assignment: string
          employee_name: string
          employee_number: string | null
          history: Json
          id: string
          office_id: string | null
          officer_id: string
          recommendations: string | null
          report_date: string
          report_number: string
          revision: number
          section_id: string | null
          signature: string | null
          stage: number
          status: string
          submitted_at: string | null
          tasks_completed: string | null
        }
        Insert: {
          activities: string
          attachments?: Json
          chain?: Json
          challenges?: string | null
          created_at?: string
          created_by: string
          duty_assignment: string
          employee_name: string
          employee_number?: string | null
          history?: Json
          id?: string
          office_id?: string | null
          officer_id: string
          recommendations?: string | null
          report_date?: string
          report_number?: string
          revision?: number
          section_id?: string | null
          signature?: string | null
          stage?: number
          status?: string
          submitted_at?: string | null
          tasks_completed?: string | null
        }
        Update: {
          activities?: string
          attachments?: Json
          chain?: Json
          challenges?: string | null
          created_at?: string
          created_by?: string
          duty_assignment?: string
          employee_name?: string
          employee_number?: string | null
          history?: Json
          id?: string
          office_id?: string | null
          officer_id?: string
          recommendations?: string | null
          report_date?: string
          report_number?: string
          revision?: number
          section_id?: string | null
          signature?: string | null
          stage?: number
          status?: string
          submitted_at?: string | null
          tasks_completed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "daily_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "daily_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinary_actions: {
        Row: {
          action_taken: string | null
          attachments: Json
          case_number: string | null
          created_at: string | null
          details: Json
          history: Json
          id: string
          incident_date: string | null
          offense: string | null
          officer_id: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          action_taken?: string | null
          attachments?: Json
          case_number?: string | null
          created_at?: string | null
          details?: Json
          history?: Json
          id?: string
          incident_date?: string | null
          offense?: string | null
          officer_id?: string | null
          recorded_by?: string | null
          status?: string
        }
        Update: {
          action_taken?: string | null
          attachments?: Json
          case_number?: string | null
          created_at?: string | null
          details?: Json
          history?: Json
          id?: string
          incident_date?: string | null
          offense?: string | null
          officer_id?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "disciplinary_actions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "disciplinary_actions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "disciplinary_actions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "disciplinary_actions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          change_log: string
          created_at: string
          created_by: string
          document_id: string
          file_name: string
          file_path: string
          id: string
          signature: string | null
          version: number
        }
        Insert: {
          change_log: string
          created_at?: string
          created_by: string
          document_id: string
          file_name: string
          file_path: string
          id?: string
          signature?: string | null
          version: number
        }
        Update: {
          change_log?: string
          created_at?: string
          created_by?: string
          document_id?: string
          file_name?: string
          file_path?: string
          id?: string
          signature?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "erp_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      erp_documents: {
        Row: {
          author_id: string
          category: string
          created_at: string
          current_version: number
          document_number: string
          history: Json
          id: string
          keywords: string | null
          published_at: string | null
          section_id: string | null
          stage: number
          status: string
          title: string
        }
        Insert: {
          author_id: string
          category: string
          created_at?: string
          current_version?: number
          document_number: string
          history?: Json
          id?: string
          keywords?: string | null
          published_at?: string | null
          section_id?: string | null
          stage?: number
          status?: string
          title: string
        }
        Update: {
          author_id?: string
          category?: string
          created_at?: string
          current_version?: number
          document_number?: string
          history?: Json
          id?: string
          keywords?: string | null
          published_at?: string | null
          section_id?: string | null
          stage?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "erp_documents_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_posts: {
        Row: {
          authorized: number
          created_at: string
          id: string
          rank_allocation: Json
          sort_order: number
          title: string
          unit_id: string
        }
        Insert: {
          authorized?: number
          created_at?: string
          id?: string
          rank_allocation?: Json
          sort_order?: number
          title: string
          unit_id: string
        }
        Update: {
          authorized?: number
          created_at?: string
          id?: string
          rank_allocation?: Json
          sort_order?: number
          title?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_posts_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "establishment_units"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_units: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number | null
          attachments: Json
          budget_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string | null
          expense_number: string | null
          expense_type: string | null
          history: Json
          id: string
          payment_method: string | null
          recorded_by: string | null
          section_id: string | null
          stage: number
          status: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          attachments?: Json
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string | null
          expense_number?: string | null
          expense_type?: string | null
          history?: Json
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          section_id?: string | null
          stage?: number
          status?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          attachments?: Json
          budget_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string | null
          expense_number?: string | null
          expense_type?: string | null
          history?: Json
          id?: string
          payment_method?: string | null
          recorded_by?: string | null
          section_id?: string | null
          stage?: number
          status?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_work_orders: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          category: string
          completed_at: string | null
          completion_notes: string | null
          confirmed_at: string | null
          created_at: string
          description: string | null
          id: string
          location: string
          priority: string
          reference: string
          reported_by: string
          reporter_name: string | null
          status: string
          technician: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          category?: string
          completed_at?: string | null
          completion_notes?: string | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location: string
          priority?: string
          reference?: string
          reported_by?: string
          reporter_name?: string | null
          status?: string
          technician?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          category?: string
          completed_at?: string | null
          completion_notes?: string | null
          confirmed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          priority?: string
          reference?: string
          reported_by?: string
          reporter_name?: string | null
          status?: string
          technician?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_approvals: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          id: string
          level: string | null
          module: string
          note: string | null
          record_id: string
          signature: string | null
          stage: number | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          module: string
          note?: string | null
          record_id: string
          signature?: string | null
          stage?: number | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          level?: string | null
          module?: string
          note?: string | null
          record_id?: string
          signature?: string | null
          stage?: number | null
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          created_at: string
          generated_by: string | null
          id: string
          period_end: string | null
          period_start: string | null
          report_type: string
          summary: Json
        }
        Insert: {
          created_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type: string
          summary?: Json
        }
        Update: {
          created_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          summary?: Json
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          booking_id: string | null
          cost: number | null
          created_at: string
          fuel_date: string | null
          fuel_type: string | null
          id: string
          litres: number | null
          odometer: number | null
          recorded_by: string | null
          remarks: string | null
          supplier_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          booking_id?: string | null
          cost?: number | null
          created_at?: string
          fuel_date?: string | null
          fuel_type?: string | null
          id?: string
          litres?: number | null
          odometer?: number | null
          recorded_by?: string | null
          remarks?: string | null
          supplier_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          booking_id?: string | null
          cost?: number | null
          created_at?: string
          fuel_date?: string | null
          fuel_type?: string | null
          id?: string
          litres?: number | null
          odometer?: number | null
          recorded_by?: string | null
          remarks?: string | null
          supplier_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "vehicle_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "fuel_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "fuel_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachments: Json
          created_at: string
          damages: string | null
          delivery_date: string
          grn_number: string | null
          history: Json
          id: string
          lines: Json
          po_id: string
          received_by: string | null
          received_by_name: string | null
          status: string
          vendor_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json
          created_at?: string
          damages?: string | null
          delivery_date?: string
          grn_number?: string | null
          history?: Json
          id?: string
          lines?: Json
          po_id: string
          received_by?: string | null
          received_by_name?: string | null
          status?: string
          vendor_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachments?: Json
          created_at?: string
          damages?: string | null
          delivery_date?: string
          grn_number?: string | null
          history?: Json
          id?: string
          lines?: Json
          po_id?: string
          received_by?: string | null
          received_by_name?: string | null
          status?: string
          vendor_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      graduations: {
        Row: {
          cadet_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: string
          id: string
          program_id: string | null
          remarks: string | null
        }
        Insert: {
          cadet_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          id?: string
          program_id?: string | null
          remarks?: string | null
        }
        Update: {
          cadet_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          id?: string
          program_id?: string | null
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "graduations_cadet_id_fkey"
            columns: ["cadet_id"]
            isOneToOne: false
            referencedRelation: "cadets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "graduations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_form_counters: {
        Row: {
          last_value: number
          year: number
        }
        Insert: {
          last_value?: number
          year: number
        }
        Update: {
          last_value?: number
          year?: number
        }
        Relationships: []
      }
      hr_reports: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "hr_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "hr_reports_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      ict_records: {
        Row: {
          attachments: Json
          category: string
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          kind: string
          number: string
          officer_id: string | null
          priority: string
          status: string
          technician_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          category: string
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          kind: string
          number?: string
          officer_id?: string | null
          priority?: string
          status?: string
          technician_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          category?: string
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          kind?: string
          number?: string
          officer_id?: string | null
          priority?: string
          status?: string
          technician_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ict_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "ict_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ict_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "ict_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ict_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "ict_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ict_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "ict_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      incoming_mail: {
        Row: {
          assigned_to: string | null
          id: string
          received_date: string | null
          reference_number: string | null
          sender: string | null
          subject: string | null
        }
        Insert: {
          assigned_to?: string | null
          id?: string
          received_date?: string | null
          reference_number?: string | null
          sender?: string | null
          subject?: string | null
        }
        Update: {
          assigned_to?: string | null
          id?: string
          received_date?: string | null
          reference_number?: string | null
          sender?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incoming_mail_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "incoming_mail_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incoming_mail_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "incoming_mail_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      instructors: {
        Row: {
          contact: string | null
          created_at: string
          department: string | null
          id: string
          instructor_code: string | null
          name: string
          officer_id: string | null
          qualification: string | null
          rank: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          department?: string | null
          id?: string
          instructor_code?: string | null
          name: string
          officer_id?: string | null
          qualification?: string | null
          rank?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          department?: string | null
          id?: string
          instructor_code?: string | null
          name?: string
          officer_id?: string | null
          qualification?: string | null
          rank?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instructors_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "instructors_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "instructors_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "instructors_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          assigned_to: string | null
          category: string
          code: string
          created_at: string
          id: string
          is_asset: boolean
          item_code: string | null
          item_name: string | null
          location: string | null
          name: string
          quantity: number
          quantity_in_stock: number | null
          reorder_level: number
          storage_location: string | null
          unit: string
          unit_cost: number
          warehouse_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_asset?: boolean
          item_code?: string | null
          item_name?: string | null
          location?: string | null
          name: string
          quantity?: number
          quantity_in_stock?: number | null
          reorder_level?: number
          storage_location?: string | null
          unit?: string
          unit_cost?: number
          warehouse_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_asset?: boolean
          item_code?: string | null
          item_name?: string | null
          location?: string | null
          name?: string
          quantity?: number
          quantity_in_stock?: number | null
          reorder_level?: number
          storage_location?: string | null
          unit?: string
          unit_cost?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          actor_id: string | null
          balance_after: number | null
          balance_before: number | null
          created_at: string
          id: string
          issue_id: string | null
          item_id: string | null
          movement_date: string | null
          movement_type: string | null
          quantity: number | null
          receipt_id: string | null
          reconciliation_id: string | null
          recorded_by: string | null
          remarks: string | null
          request_id: string | null
          to_warehouse_id: string | null
          transfer_id: string | null
          warehouse_id: string | null
        }
        Insert: {
          actor_id?: string | null
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          issue_id?: string | null
          item_id?: string | null
          movement_date?: string | null
          movement_type?: string | null
          quantity?: number | null
          receipt_id?: string | null
          reconciliation_id?: string | null
          recorded_by?: string | null
          remarks?: string | null
          request_id?: string | null
          to_warehouse_id?: string | null
          transfer_id?: string | null
          warehouse_id?: string | null
        }
        Update: {
          actor_id?: string | null
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          issue_id?: string | null
          item_id?: string | null
          movement_date?: string | null
          movement_type?: string | null
          quantity?: number | null
          receipt_id?: string | null
          reconciliation_id?: string | null
          recorded_by?: string | null
          remarks?: string | null
          request_id?: string | null
          to_warehouse_id?: string | null
          transfer_id?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "store_issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "store_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "stock_reconciliation"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "inventory_movements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "inventory_movements_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "inventory_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_request_items"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "inventory_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "supply_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      iss_duty_roster: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          officer_name: string
          post: string
          recorded_by: string
          shift: string
          shift_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          officer_name: string
          post: string
          recorded_by?: string
          shift: string
          shift_date: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          officer_name?: string
          post?: string
          recorded_by?: string
          shift?: string
          shift_date?: string
        }
        Relationships: []
      }
      iss_gate_logs: {
        Row: {
          created_at: string
          direction: string
          driver_name: string | null
          gate: string
          id: string
          logged_at: string
          plate_number: string
          purpose: string | null
          recorded_by: string
        }
        Insert: {
          created_at?: string
          direction: string
          driver_name?: string | null
          gate?: string
          id?: string
          logged_at?: string
          plate_number: string
          purpose?: string | null
          recorded_by?: string
        }
        Update: {
          created_at?: string
          direction?: string
          driver_name?: string | null
          gate?: string
          id?: string
          logged_at?: string
          plate_number?: string
          purpose?: string | null
          recorded_by?: string
        }
        Relationships: []
      }
      iss_occurrences: {
        Row: {
          action_taken: string | null
          category: string
          created_at: string
          description: string
          id: string
          location: string
          ob_number: string
          occurred_at: string
          recorded_by: string
          status: string
          updated_at: string
        }
        Insert: {
          action_taken?: string | null
          category?: string
          created_at?: string
          description: string
          id?: string
          location: string
          ob_number?: string
          occurred_at?: string
          recorded_by?: string
          status?: string
          updated_at?: string
        }
        Update: {
          action_taken?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          location?: string
          ob_number?: string
          occurred_at?: string
          recorded_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      iss_visitors: {
        Row: {
          badge_number: string | null
          created_at: string
          host: string | null
          id: string
          id_number: string | null
          organization: string | null
          phone: string | null
          purpose: string
          recorded_by: string
          time_in: string
          time_out: string | null
          visitor_name: string
        }
        Insert: {
          badge_number?: string | null
          created_at?: string
          host?: string | null
          id?: string
          id_number?: string | null
          organization?: string | null
          phone?: string | null
          purpose: string
          recorded_by?: string
          time_in?: string
          time_out?: string | null
          visitor_name: string
        }
        Update: {
          badge_number?: string | null
          created_at?: string
          host?: string | null
          id?: string
          id_number?: string | null
          organization?: string | null
          phone?: string | null
          purpose?: string
          recorded_by?: string
          time_in?: string
          time_out?: string | null
          visitor_name?: string
        }
        Relationships: []
      }
      leave_balances: {
        Row: {
          annual_leave_allocated: number | null
          annual_leave_balance: number | null
          annual_leave_used: number | null
          emergency_leave_used: number | null
          id: string
          officer_id: string | null
          sick_leave_used: number | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          annual_leave_allocated?: number | null
          annual_leave_balance?: number | null
          annual_leave_used?: number | null
          emergency_leave_used?: number | null
          id?: string
          officer_id?: string | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          annual_leave_allocated?: number | null
          annual_leave_balance?: number | null
          annual_leave_used?: number | null
          emergency_leave_used?: number | null
          id?: string
          officer_id?: string | null
          sick_leave_used?: number | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "leave_balances_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "leave_balances_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approval_status: string | null
          attachments: Json
          created_at: string
          current_step: string | null
          delegate_officer_id: string | null
          end_date: string
          history: Json
          hr_processed_at: string | null
          id: string
          leave_number: string | null
          leave_type: string
          officer_id: string | null
          reason: string | null
          recall_reason: string | null
          recalled_at: string | null
          requested_by: string | null
          stage: number
          start_date: string
          status: string
          total_days: number | null
          workflow_kind: string
        }
        Insert: {
          approval_status?: string | null
          attachments?: Json
          created_at?: string
          current_step?: string | null
          delegate_officer_id?: string | null
          end_date: string
          history?: Json
          hr_processed_at?: string | null
          id?: string
          leave_number?: string | null
          leave_type: string
          officer_id?: string | null
          reason?: string | null
          recall_reason?: string | null
          recalled_at?: string | null
          requested_by?: string | null
          stage?: number
          start_date: string
          status?: string
          total_days?: number | null
          workflow_kind?: string
        }
        Update: {
          approval_status?: string | null
          attachments?: Json
          created_at?: string
          current_step?: string | null
          delegate_officer_id?: string | null
          end_date?: string
          history?: Json
          hr_processed_at?: string | null
          id?: string
          leave_number?: string | null
          leave_type?: string
          officer_id?: string | null
          reason?: string | null
          recall_reason?: string | null
          recalled_at?: string | null
          requested_by?: string | null
          stage?: number
          start_date?: string
          status?: string
          total_days?: number | null
          workflow_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_delegate_officer_id_fkey"
            columns: ["delegate_officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "leave_requests_delegate_officer_id_fkey"
            columns: ["delegate_officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_delegate_officer_id_fkey"
            columns: ["delegate_officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "leave_requests_delegate_officer_id_fkey"
            columns: ["delegate_officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "leave_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "leave_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_accounts: {
        Row: {
          created_at: string
          email: string
          host: string
          id: string
          secret: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          host?: string
          id?: string
          secret: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          host?: string
          id?: string
          secret?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string
          description: string | null
          id: string
          maintenance_date: string | null
          maintenance_type: string | null
          next_service_date: string | null
          odometer: number | null
          recorded_by: string | null
          supplier_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date?: string | null
          maintenance_type?: string | null
          next_service_date?: string | null
          odometer?: number | null
          recorded_by?: string | null
          supplier_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_date?: string | null
          maintenance_type?: string | null
          next_service_date?: string | null
          odometer?: number | null
          recorded_by?: string | null
          supplier_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "maintenance_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "maintenance_logs_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          event_key: string | null
          id: string
          is_read: boolean | null
          message: string | null
          read: boolean
          role: Database["public"]["Enums"]["app_role"] | null
          title: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          event_key?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read?: boolean
          role?: Database["public"]["Enums"]["app_role"] | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          event_key?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          read?: boolean
          role?: Database["public"]["Enums"]["app_role"] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      officer_documents: {
        Row: {
          bucket_id: string
          document_name: string | null
          document_type: string | null
          file_url: string | null
          id: string
          officer_id: string | null
          upload_date: string | null
          uploaded_by: string | null
        }
        Insert: {
          bucket_id?: string
          document_name?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          officer_id?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Update: {
          bucket_id?: string
          document_name?: string | null
          document_type?: string | null
          file_url?: string | null
          id?: string
          officer_id?: string | null
          upload_date?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officer_documents_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "officer_documents_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officer_documents_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "officer_documents_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      officers: {
        Row: {
          address: string | null
          archived_at: string | null
          blood_group: string | null
          commendations: string | null
          county: string | null
          created_at: string
          created_by: string | null
          current_assignment: string | null
          date_joined: string | null
          date_of_birth: string | null
          designation: string | null
          disciplinary_actions: string | null
          education: string | null
          email: string | null
          email_notes: string | null
          email_sent_at: string | null
          email_sent_by: string | null
          email_status: string
          emergency_contact: string | null
          employee_number: string | null
          employment_status: string
          employment_type: string
          enrollment_profile: Json
          enrollment_status: string
          establishment_post_id: string | null
          first_name: string | null
          form_number: string | null
          full_name: string
          gender: string | null
          id: string
          last_name: string | null
          lnp_class_number: string | null
          marital_status: string | null
          medical_info: string | null
          middle_name: string | null
          nationality: string | null
          next_of_kin: string | null
          next_of_kin_phone: string | null
          office_id: string | null
          official_email: string | null
          personnel_category: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          profile_photo: string | null
          promotion_history: string | null
          rank: string
          retirement_date: string | null
          section_id: string | null
          service_number: string
          supervisor_id: string | null
          training_history: string | null
          updated_at: string
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          blood_group?: string | null
          commendations?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          current_assignment?: string | null
          date_joined?: string | null
          date_of_birth?: string | null
          designation?: string | null
          disciplinary_actions?: string | null
          education?: string | null
          email?: string | null
          email_notes?: string | null
          email_sent_at?: string | null
          email_sent_by?: string | null
          email_status?: string
          emergency_contact?: string | null
          employee_number?: string | null
          employment_status?: string
          employment_type?: string
          enrollment_profile?: Json
          enrollment_status?: string
          establishment_post_id?: string | null
          first_name?: string | null
          form_number?: string | null
          full_name: string
          gender?: string | null
          id?: string
          last_name?: string | null
          lnp_class_number?: string | null
          marital_status?: string | null
          medical_info?: string | null
          middle_name?: string | null
          nationality?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          office_id?: string | null
          official_email?: string | null
          personnel_category?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_photo?: string | null
          promotion_history?: string | null
          rank: string
          retirement_date?: string | null
          section_id?: string | null
          service_number: string
          supervisor_id?: string | null
          training_history?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          blood_group?: string | null
          commendations?: string | null
          county?: string | null
          created_at?: string
          created_by?: string | null
          current_assignment?: string | null
          date_joined?: string | null
          date_of_birth?: string | null
          designation?: string | null
          disciplinary_actions?: string | null
          education?: string | null
          email?: string | null
          email_notes?: string | null
          email_sent_at?: string | null
          email_sent_by?: string | null
          email_status?: string
          emergency_contact?: string | null
          employee_number?: string | null
          employment_status?: string
          employment_type?: string
          enrollment_profile?: Json
          enrollment_status?: string
          establishment_post_id?: string | null
          first_name?: string | null
          form_number?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          last_name?: string | null
          lnp_class_number?: string | null
          marital_status?: string | null
          medical_info?: string | null
          middle_name?: string | null
          nationality?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          office_id?: string | null
          official_email?: string | null
          personnel_category?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_photo?: string | null
          promotion_history?: string | null
          rank?: string
          retirement_date?: string | null
          section_id?: string | null
          service_number?: string
          supervisor_id?: string | null
          training_history?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officers_establishment_post_id_fkey"
            columns: ["establishment_post_id"]
            isOneToOne: false
            referencedRelation: "establishment_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      offices: {
        Row: {
          description: string | null
          id: string
          name: string
          office_name: string | null
          office_type: string | null
          parent_office: string | null
          rank_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          office_name?: string | null
          office_type?: string | null
          parent_office?: string | null
          rank_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          office_name?: string | null
          office_type?: string | null
          parent_office?: string | null
          rank_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "offices_parent_office_fkey"
            columns: ["parent_office"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      outgoing_mail: {
        Row: {
          created_by: string | null
          dispatch_date: string | null
          id: string
          recipient: string | null
          reference_number: string | null
          subject: string | null
        }
        Insert: {
          created_by?: string | null
          dispatch_date?: string | null
          id?: string
          recipient?: string | null
          reference_number?: string | null
          subject?: string | null
        }
        Update: {
          created_by?: string | null
          dispatch_date?: string | null
          id?: string
          recipient?: string | null
          reference_number?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outgoing_mail_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "outgoing_mail_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outgoing_mail_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "outgoing_mail_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "payroll_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "payroll_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_appraisals: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_appraisals_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "performance_appraisals_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_appraisals_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "performance_appraisals_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_funding: {
        Row: {
          budget_id: string | null
          created_at: string
          estimated_cost: number
          funding_code: string | null
          history: Json
          id: string
          is_ict: boolean
          item_description: string
          justification: string | null
          priority: string
          purchase_order_id: string | null
          quantity: number
          request_date: string
          request_number: string | null
          requested_by: string
          section_id: string | null
          stage: number
          status: string
          unit: string | null
          vendor_id: string | null
        }
        Insert: {
          budget_id?: string | null
          created_at?: string
          estimated_cost: number
          funding_code?: string | null
          history?: Json
          id?: string
          is_ict?: boolean
          item_description: string
          justification?: string | null
          priority?: string
          purchase_order_id?: string | null
          quantity?: number
          request_date?: string
          request_number?: string | null
          requested_by?: string
          section_id?: string | null
          stage?: number
          status?: string
          unit?: string | null
          vendor_id?: string | null
        }
        Update: {
          budget_id?: string | null
          created_at?: string
          estimated_cost?: number
          funding_code?: string | null
          history?: Json
          id?: string
          is_ict?: boolean
          item_description?: string
          justification?: string | null
          priority?: string
          purchase_order_id?: string | null
          quantity?: number
          request_date?: string
          request_number?: string | null
          requested_by?: string
          section_id?: string | null
          stage?: number
          status?: string
          unit?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_funding_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_funding_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_funding_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_funding_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_funding_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_reports: {
        Row: {
          created_at: string
          generated_by: string | null
          id: string
          period_end: string | null
          period_start: string | null
          report_type: string
          summary: Json
        }
        Insert: {
          created_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type: string
          summary?: Json
        }
        Update: {
          created_at?: string
          generated_by?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          summary?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      program_enrollments: {
        Row: {
          cadet_id: string
          enrolled_date: string
          id: string
          program_id: string
          status: string
        }
        Insert: {
          cadet_id: string
          enrolled_date?: string
          id?: string
          program_id: string
          status?: string
        }
        Update: {
          cadet_id?: string
          enrolled_date?: string
          id?: string
          program_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_enrollments_cadet_id_fkey"
            columns: ["cadet_id"]
            isOneToOne: false
            referencedRelation: "cadets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "training_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          previous_rank: string | null
          promoted_rank: string | null
          promotion_date: string | null
          remarks: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          previous_rank?: string | null
          promoted_rank?: string | null
          promotion_date?: string | null
          remarks?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          previous_rank?: string | null
          promoted_rank?: string | null
          promotion_date?: string | null
          remarks?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "promotions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "promotions_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          asset_category: string | null
          created_at: string
          description: string
          id: string
          inventory_item_id: string | null
          is_asset: boolean
          po_id: string
          quantity: number
          quantity_received: number
          quantity_rejected: number
          unit_price: number
        }
        Insert: {
          asset_category?: string | null
          created_at?: string
          description: string
          id?: string
          inventory_item_id?: string | null
          is_asset?: boolean
          po_id: string
          quantity: number
          quantity_received?: number
          quantity_rejected?: number
          unit_price?: number
        }
        Update: {
          asset_category?: string | null
          created_at?: string
          description?: string
          id?: string
          inventory_item_id?: string | null
          is_asset?: boolean
          po_id?: string
          quantity?: number
          quantity_received?: number
          quantity_rejected?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          amount: number | null
          created_at: string
          created_by: string | null
          delivery_date: string | null
          history: Json
          id: string
          notes: string | null
          po_number: string | null
          procurement_request_id: string | null
          quotation_id: string | null
          request_id: string | null
          status: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          history?: Json
          id?: string
          notes?: string | null
          po_number?: string | null
          procurement_request_id?: string | null
          quotation_id?: string | null
          request_id?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          history?: Json
          id?: string
          notes?: string | null
          po_number?: string | null
          procurement_request_id?: string | null
          quotation_id?: string | null
          request_id?: string | null
          status?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_procurement_request_id_fkey"
            columns: ["procurement_request_id"]
            isOneToOne: false
            referencedRelation: "procurement_funding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          department: string | null
          description: string | null
          estimated_cost: number | null
          id: string
          request_no: string | null
          requested_by: string | null
          status: string | null
        }
        Insert: {
          department?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          request_no?: string | null
          requested_by?: string | null
          status?: string | null
        }
        Update: {
          department?: string | null
          description?: string | null
          estimated_cost?: number | null
          id?: string
          request_no?: string | null
          requested_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_department_fkey"
            columns: ["department"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "purchase_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_comparisons: {
        Row: {
          created_at: string
          decided_by: string | null
          id: string
          justification: string | null
          lowest_quotation_id: string | null
          request_id: string
          selected_quotation_id: string
        }
        Insert: {
          created_at?: string
          decided_by?: string | null
          id?: string
          justification?: string | null
          lowest_quotation_id?: string | null
          request_id: string
          selected_quotation_id: string
        }
        Update: {
          created_at?: string
          decided_by?: string | null
          id?: string
          justification?: string | null
          lowest_quotation_id?: string | null
          request_id?: string
          selected_quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_comparisons_lowest_quotation_id_fkey"
            columns: ["lowest_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_comparisons_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "procurement_funding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_comparisons_selected_quotation_id_fkey"
            columns: ["selected_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string | null
          delivery_days: number | null
          id: string
          quoted_amount: number | null
          received_at: string | null
          remarks: string | null
          request_id: string
          rfq_number: string | null
          rfq_sent_at: string
          status: string
          validity_days: number | null
          vendor_id: string
          warranty: string | null
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string | null
          delivery_days?: number | null
          id?: string
          quoted_amount?: number | null
          received_at?: string | null
          remarks?: string | null
          request_id: string
          rfq_number?: string | null
          rfq_sent_at?: string
          status?: string
          validity_days?: number | null
          vendor_id: string
          warranty?: string | null
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string | null
          delivery_days?: number | null
          id?: string
          quoted_amount?: number | null
          received_at?: string | null
          remarks?: string | null
          request_id?: string
          rfq_number?: string | null
          rfq_sent_at?: string
          status?: string
          validity_days?: number | null
          vendor_id?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_funding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_applicants: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_applicants_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "recruitment_applicants_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_applicants_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "recruitment_applicants_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      recruitment_vacancies: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_vacancies_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "recruitment_vacancies_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recruitment_vacancies_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "recruitment_vacancies_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      registry_counters: {
        Row: {
          direction: string
          last_number: number
          year: number
        }
        Insert: {
          direction: string
          last_number?: number
          year: number
        }
        Update: {
          direction?: string
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      report_branding: {
        Row: {
          footer_text: string
          id: number
          letterhead_path: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          footer_text?: string
          id?: number
          letterhead_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          footer_text?: string
          id?: number
          letterhead_path?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      report_numbers: {
        Row: {
          day: string
          last_no: number
        }
        Insert: {
          day: string
          last_no?: number
        }
        Update: {
          day?: string
          last_no?: number
        }
        Relationships: []
      }
      reporting_lines: {
        Row: {
          id: string
          kind: string
          office_id: string | null
          officer_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          kind: string
          office_id?: string | null
          officer_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          kind?: string
          office_id?: string | null
          officer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reporting_lines_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_lines_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "reporting_lines_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reporting_lines_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "reporting_lines_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      request_items: {
        Row: {
          created_at: string
          description: string
          estimated_unit_cost: number
          id: string
          quantity: number
          request_id: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          description: string
          estimated_unit_cost?: number
          id?: string
          quantity?: number
          request_id: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          estimated_unit_cost?: number
          id?: string
          quantity?: number
          request_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_funding"
            referencedColumns: ["id"]
          },
        ]
      }
      revenues: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          received_by: string | null
          received_by_name: string | null
          received_date: string
          revenue_number: string | null
          source: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          received_by?: string | null
          received_by_name?: string | null
          received_date?: string
          revenue_number?: string | null
          source: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          received_by?: string | null
          received_by_name?: string | null
          received_date?: string
          revenue_number?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenues_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "revenues_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenues_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "revenues_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string | null
          id: string
          name: string
          office_id: string | null
          section_head: string | null
          section_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          office_id?: string | null
          section_head?: string | null
          section_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          office_id?: string | null
          section_head?: string | null
          section_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_section_head_fkey"
            columns: ["section_head"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "sections_section_head_fkey"
            columns: ["section_head"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_section_head_fkey"
            columns: ["section_head"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "sections_section_head_fkey"
            columns: ["section_head"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_analysis_access: {
        Row: {
          blocked: boolean
          id: string
          reason: string | null
          status_code: number | null
          updated_at: string
        }
        Insert: {
          blocked?: boolean
          id?: string
          reason?: string | null
          status_code?: number | null
          updated_at?: string
        }
        Update: {
          blocked?: boolean
          id?: string
          reason?: string | null
          status_code?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_reconciliation: {
        Row: {
          balance_after: number | null
          balance_before: number | null
          counted_by: string | null
          counted_quantity: number | null
          created_at: string
          id: string
          item_id: string | null
          posted_at: string | null
          posted_by: string | null
          reason: string | null
          reconciliation_date: string | null
          reconciliation_number: string | null
          reviewed_by: string | null
          system_quantity: number | null
          variance: number | null
          warehouse_id: string | null
        }
        Insert: {
          balance_after?: number | null
          balance_before?: number | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          id?: string
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reason?: string | null
          reconciliation_date?: string | null
          reconciliation_number?: string | null
          reviewed_by?: string | null
          system_quantity?: number | null
          variance?: number | null
          warehouse_id?: string | null
        }
        Update: {
          balance_after?: number | null
          balance_before?: number | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string
          id?: string
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          reason?: string | null
          reconciliation_date?: string | null
          reconciliation_number?: string | null
          reviewed_by?: string | null
          system_quantity?: number | null
          variance?: number | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_reconciliation_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "stock_reconciliation_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "stock_reconciliation_counted_by_fkey"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "stock_reconciliation_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "stock_reconciliation_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reconciliation_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string
          from_warehouse_id: string | null
          id: string
          item_id: string
          posted_by: string
          quantity: number
          reason: string
          to_warehouse_id: string | null
        }
        Insert: {
          created_at?: string
          from_warehouse_id?: string | null
          id?: string
          item_id: string
          posted_by: string
          quantity: number
          reason: string
          to_warehouse_id?: string | null
        }
        Update: {
          created_at?: string
          from_warehouse_id?: string | null
          id?: string
          item_id?: string
          posted_by?: string
          quantity?: number
          reason?: string
          to_warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_warehouse_id_fkey"
            columns: ["from_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_warehouse_id_fkey"
            columns: ["to_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      store_issues: {
        Row: {
          balance_after: number | null
          balance_before: number | null
          created_at: string
          id: string
          issue_date: string | null
          issue_number: string | null
          issued_by: string | null
          issued_to: string | null
          item_id: string | null
          posted_at: string | null
          posted_by: string | null
          quantity: number | null
          remarks: string | null
          request_id: string | null
          section_id: string | null
          unit: string | null
          warehouse_id: string | null
        }
        Insert: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          issue_date?: string | null
          issue_number?: string | null
          issued_by?: string | null
          issued_to?: string | null
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          quantity?: number | null
          remarks?: string | null
          request_id?: string | null
          section_id?: string | null
          unit?: string | null
          warehouse_id?: string | null
        }
        Update: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          issue_date?: string | null
          issue_number?: string | null
          issued_by?: string | null
          issued_to?: string | null
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          quantity?: number | null
          remarks?: string | null
          request_id?: string | null
          section_id?: string | null
          unit?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "store_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "store_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "store_issues_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "store_issues_issued_to_fkey"
            columns: ["issued_to"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "store_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_request_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_request_items"
            referencedColumns: ["request_id"]
          },
          {
            foreignKeyName: "store_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "supply_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_issues_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      store_receipts: {
        Row: {
          balance_after: number | null
          balance_before: number | null
          created_at: string
          id: string
          item_id: string | null
          posted_at: string | null
          posted_by: string | null
          purchase_order_id: string | null
          quantity: number | null
          receipt_date: string | null
          receipt_number: string | null
          received_by: string | null
          remarks: string | null
          supplier_id: string | null
          unit: string | null
          warehouse_id: string | null
        }
        Insert: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          purchase_order_id?: string | null
          quantity?: number | null
          receipt_date?: string | null
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
          supplier_id?: string | null
          unit?: string | null
          warehouse_id?: string | null
        }
        Update: {
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          id?: string
          item_id?: string | null
          posted_at?: string | null
          posted_by?: string | null
          purchase_order_id?: string | null
          quantity?: number | null
          receipt_date?: string | null
          receipt_number?: string | null
          received_by?: string | null
          remarks?: string | null
          supplier_id?: string | null
          unit?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_receipts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "store_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "store_receipts_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_receipts_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_performance: {
        Row: {
          compliance: number | null
          created_at: string
          grn_id: string | null
          id: string
          po_id: string | null
          pricing: number | null
          quality: number | null
          rated_by: string | null
          remarks: string | null
          score: number | null
          service: number | null
          timeliness: number | null
          vendor_id: string
        }
        Insert: {
          compliance?: number | null
          created_at?: string
          grn_id?: string | null
          id?: string
          po_id?: string | null
          pricing?: number | null
          quality?: number | null
          rated_by?: string | null
          remarks?: string | null
          score?: number | null
          service?: number | null
          timeliness?: number | null
          vendor_id: string
        }
        Update: {
          compliance?: number | null
          created_at?: string
          grn_id?: string | null
          id?: string
          po_id?: string | null
          pricing?: number | null
          quality?: number | null
          rated_by?: string | null
          remarks?: string | null
          score?: number | null
          service?: number | null
          timeliness?: number | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_performance_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: true
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_performance_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_requests: {
        Row: {
          approval_status: string
          attachments: Json
          collection_status: string
          command_chain: Json
          command_stage: number
          created_at: string
          description: string | null
          fulfillment_warehouse: string | null
          history: Json
          id: string
          item_id: string | null
          item_name: string
          justification: string | null
          officer_id: string | null
          pickup_signature: string | null
          pickup_signed_at: string | null
          pickup_signed_by: string | null
          priority: string
          procurement_id: string | null
          quantity: number
          request_date: string
          request_number: string
          requested_by: string | null
          requested_by_name: string | null
          required_date: string | null
          reserved_quantity: number
          section_id: string | null
          stage: number
          unit: string
          workflow_kind: string
        }
        Insert: {
          approval_status?: string
          attachments?: Json
          collection_status?: string
          command_chain?: Json
          command_stage?: number
          created_at?: string
          description?: string | null
          fulfillment_warehouse?: string | null
          history?: Json
          id?: string
          item_id?: string | null
          item_name: string
          justification?: string | null
          officer_id?: string | null
          pickup_signature?: string | null
          pickup_signed_at?: string | null
          pickup_signed_by?: string | null
          priority?: string
          procurement_id?: string | null
          quantity: number
          request_date?: string
          request_number?: string
          requested_by?: string | null
          requested_by_name?: string | null
          required_date?: string | null
          reserved_quantity?: number
          section_id?: string | null
          stage?: number
          unit?: string
          workflow_kind?: string
        }
        Update: {
          approval_status?: string
          attachments?: Json
          collection_status?: string
          command_chain?: Json
          command_stage?: number
          created_at?: string
          description?: string | null
          fulfillment_warehouse?: string | null
          history?: Json
          id?: string
          item_id?: string | null
          item_name?: string
          justification?: string | null
          officer_id?: string | null
          pickup_signature?: string | null
          pickup_signed_at?: string | null
          pickup_signed_by?: string | null
          priority?: string
          procurement_id?: string | null
          quantity?: number
          request_date?: string
          request_number?: string
          requested_by?: string | null
          requested_by_name?: string | null
          required_date?: string | null
          reserved_quantity?: number
          section_id?: string | null
          stage?: number
          unit?: string
          workflow_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_requests_fulfillment_warehouse_fkey"
            columns: ["fulfillment_warehouse"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "supply_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "supply_requests_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_procurement_id_fkey"
            columns: ["procurement_id"]
            isOneToOne: false
            referencedRelation: "procurement_funding"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_requests_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          email: string | null
          history: Json
          id: string
          issue_type: string | null
          phone: string | null
          priority: string | null
          reported_by: string | null
          requester_name: string | null
          resolved_at: string | null
          status: string | null
          subject: string | null
          ticket_number: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          email?: string | null
          history?: Json
          id?: string
          issue_type?: string | null
          phone?: string | null
          priority?: string | null
          reported_by?: string | null
          requester_name?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_number?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          email?: string | null
          history?: Json
          id?: string
          issue_type?: string | null
          phone?: string | null
          priority?: string | null
          reported_by?: string | null
          requester_name?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string | null
          ticket_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "tickets_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "tickets_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      training_programs: {
        Row: {
          coordinator: string | null
          description: string | null
          end_date: string | null
          id: string
          max_enrollment: number | null
          objectives: string | null
          program_code: string | null
          start_date: string | null
          status: string
          title: string | null
        }
        Insert: {
          coordinator?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_enrollment?: number | null
          objectives?: string | null
          program_code?: string | null
          start_date?: string | null
          status?: string
          title?: string | null
        }
        Update: {
          coordinator?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          max_enrollment?: number | null
          objectives?: string | null
          program_code?: string | null
          start_date?: string | null
          status?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_programs_coordinator_fkey"
            columns: ["coordinator"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "training_programs_coordinator_fkey"
            columns: ["coordinator"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_programs_coordinator_fkey"
            columns: ["coordinator"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "training_programs_coordinator_fkey"
            columns: ["coordinator"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "training_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "training_records_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          attachments: Json
          created_at: string
          created_by: string
          details: Json
          history: Json
          id: string
          officer_id: string | null
          status: string
        }
        Insert: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Update: {
          attachments?: Json
          created_at?: string
          created_by?: string
          details?: Json
          history?: Json
          id?: string
          officer_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "transfers_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "transfers_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_bookings: {
        Row: {
          created_at: string
          destination: string | null
          driver_id: string | null
          end_at: string | null
          id: string
          purpose: string | null
          remarks: string | null
          requested_by: string | null
          section_id: string | null
          start_at: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          destination?: string | null
          driver_id?: string | null
          end_at?: string | null
          id?: string
          purpose?: string | null
          remarks?: string | null
          requested_by?: string | null
          section_id?: string | null
          start_at?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          destination?: string | null
          driver_id?: string | null
          end_at?: string | null
          id?: string
          purpose?: string | null
          remarks?: string | null
          requested_by?: string | null
          section_id?: string | null
          start_at?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "vehicle_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "vehicle_bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "vehicle_bookings_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "vehicle_bookings_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          assigned_driver: string | null
          id: string
          make: string | null
          model: string | null
          status: string | null
          vehicle_no: string | null
          year: number | null
        }
        Insert: {
          assigned_driver?: string | null
          id?: string
          make?: string | null
          model?: string | null
          status?: string | null
          vehicle_no?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver?: string | null
          id?: string
          make?: string | null
          model?: string | null
          status?: string | null
          vehicle_no?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          category: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          phone: string | null
          registration_number: string | null
          status: string
          tin: string | null
          vendor_code: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          category?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          registration_number?: string | null
          status?: string
          tin?: string | null
          vendor_code?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          category?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          phone?: string | null
          registration_number?: string | null
          status?: string
          tin?: string | null
          vendor_code?: string | null
        }
        Relationships: []
      }
      warehouse_stock: {
        Row: {
          id: string
          item_id: string
          quantity: number
          warehouse_id: string | null
        }
        Insert: {
          id?: string
          item_id: string
          quantity?: number
          warehouse_id?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          quantity?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          created_at: string
          id: string
          location: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      approval_logs: {
        Row: {
          action: string | null
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          id: string | null
          level: string | null
          module: string | null
          note: string | null
          record_id: string | null
          signature: string | null
          stage: number | null
        }
        Insert: {
          action?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          id?: string | null
          level?: string | null
          module?: string | null
          note?: string | null
          record_id?: string | null
          signature?: string | null
          stage?: number | null
        }
        Update: {
          action?: string | null
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          id?: string | null
          level?: string | null
          module?: string | null
          note?: string | null
          record_id?: string | null
          signature?: string | null
          stage?: number | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          action_date: string | null
          action_taken: string | null
          approver_id: string | null
          comments: string | null
          id: string | null
          office_id: string | null
          request_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officers_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string | null
          blood_group: string | null
          commendations: string | null
          county: string | null
          created_at: string | null
          current_assignment: string | null
          date_joined: string | null
          date_of_birth: string | null
          designation: string | null
          disciplinary_actions: string | null
          education: string | null
          email: string | null
          emergency_contact: string | null
          employee_number: string | null
          employment_status: string | null
          employment_type: string | null
          first_name: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          last_name: string | null
          marital_status: string | null
          medical_info: string | null
          middle_name: string | null
          nationality: string | null
          next_of_kin: string | null
          next_of_kin_phone: string | null
          office_id: string | null
          phone: string | null
          photo_url: string | null
          position: string | null
          profile_photo: string | null
          promotion_history: string | null
          rank: string | null
          retirement_date: string | null
          section_id: string | null
          service_number: string | null
          supervisor_id: string | null
          training_history: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          commendations?: string | null
          county?: string | null
          created_at?: string | null
          current_assignment?: string | null
          date_joined?: string | null
          date_of_birth?: string | null
          designation?: string | null
          disciplinary_actions?: string | null
          education?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_number?: string | null
          employment_status?: string | null
          employment_type?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          last_name?: string | null
          marital_status?: string | null
          medical_info?: string | null
          middle_name?: string | null
          nationality?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          office_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_photo?: string | null
          promotion_history?: string | null
          rank?: string | null
          retirement_date?: string | null
          section_id?: string | null
          service_number?: string | null
          supervisor_id?: string | null
          training_history?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          commendations?: string | null
          county?: string | null
          created_at?: string | null
          current_assignment?: string | null
          date_joined?: string | null
          date_of_birth?: string | null
          designation?: string | null
          disciplinary_actions?: string | null
          education?: string | null
          email?: string | null
          emergency_contact?: string | null
          employee_number?: string | null
          employment_status?: string | null
          employment_type?: string | null
          first_name?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string | null
          last_name?: string | null
          marital_status?: string | null
          medical_info?: string | null
          middle_name?: string | null
          nationality?: string | null
          next_of_kin?: string | null
          next_of_kin_phone?: string | null
          office_id?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          profile_photo?: string | null
          promotion_history?: string | null
          rank?: string | null
          retirement_date?: string | null
          section_id?: string | null
          service_number?: string | null
          supervisor_id?: string | null
          training_history?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "officers_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "offices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["approver_id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "equipment_requests"
            referencedColumns: ["requested_by"]
          },
          {
            foreignKeyName: "officers_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "officers"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_request_items: {
        Row: {
          description: string | null
          id: string | null
          item_id: string | null
          item_name: string | null
          quantity: number | null
          request_id: string | null
          unit: string | null
        }
        Insert: {
          description?: string | null
          id?: string | null
          item_id?: string | null
          item_name?: string | null
          quantity?: number | null
          request_id?: string | null
          unit?: string | null
        }
        Update: {
          description?: string | null
          id?: string | null
          item_id?: string | null
          item_name?: string | null
          quantity?: number | null
          request_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_requests_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_requests: {
        Row: {
          collection_status: string | null
          commandant_approval: string | null
          created_at: string | null
          id: string | null
          item_name: string | null
          priority: string | null
          purpose: string | null
          quantity: number | null
          request_date: string | null
          request_number: string | null
          requested_by: string | null
          requesting_section: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supply_requests_section_id_fkey"
            columns: ["requesting_section"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          company_name: string | null
          contact_person: string | null
          email: string | null
          id: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          email?: string | null
          id?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          email?: string | null
          id?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      act_on_leave: {
        Args: { _approve: boolean; _id: string; _note?: string }
        Returns: undefined
      }
      act_on_supply: {
        Args: { _approve: boolean; _id: string; _note?: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _grant: boolean
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      attendance_alert: {
        Args: { _body: string; _key: string; _title: string }
        Returns: undefined
      }
      attendance_device_watch: { Args: never; Returns: undefined }
      attendance_staff: { Args: never; Returns: boolean }
      can_read_document: { Args: { _id: string }; Returns: boolean }
      cancel_appointment: { Args: { _id: string }; Returns: undefined }
      command_accounts: { Args: never; Returns: Json }
      command_assign: { Args: { _payload: Json }; Returns: undefined }
      command_chain: {
        Args: { _officer: string; _supply?: boolean }
        Returns: Json
      }
      command_directory: { Args: never; Returns: Json }
      command_file_reader: { Args: { _path: string }; Returns: boolean }
      command_inventory_overview: { Args: never; Returns: Json }
      command_link_account: {
        Args: { _officer: string; _user: string }
        Returns: undefined
      }
      command_map_supply_item: {
        Args: { _id: string; _item: string }
        Returns: undefined
      }
      command_notify: {
        Args: { _body: string; _key: string; _title: string; _user: string }
        Returns: undefined
      }
      command_report_reader: { Args: { _id: string }; Returns: boolean }
      command_report_summary: { Args: { _date?: string }; Returns: Json }
      command_supply_action: {
        Args: { _action: string; _id: string; _payload?: Json }
        Returns: string
      }
      command_supply_evidence: { Args: { _id: string }; Returns: Json }
      command_supply_reader: { Args: { _id: string }; Returns: boolean }
      command_supply_route: { Args: { _id: string }; Returns: undefined }
      command_validate_files: { Args: { _files: Json }; Returns: undefined }
      compilation_action: {
        Args: { _action: string; _id: string; _payload: Json }
        Returns: undefined
      }
      compile_daily_reports: { Args: { _payload: Json }; Returns: string }
      daily_report_action: {
        Args: { _action: string; _id: string; _payload?: Json }
        Returns: string
      }
      daily_report_alerts: { Args: { _at?: string }; Returns: number }
      decide_appointment: {
        Args: { _approve: boolean; _id: string; _note: string }
        Returns: undefined
      }
      facility_action: {
        Args: { _action: string; _id: string; _payload?: Json }
        Returns: undefined
      }
      finance_reader: { Args: never; Returns: boolean }
      finance_staff: { Args: never; Returns: boolean }
      finance_workflow: {
        Args: {
          _action: string
          _amount?: number
          _id: string
          _module: string
          _note?: string
        }
        Returns: undefined
      }
      graduate_cadet: {
        Args: { _cadet_id: string; _decision: string; _remarks?: string }
        Returns: string
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hr_action: {
        Args: { _action: string; _id: string; _module: string; _payload?: Json }
        Returns: string
      }
      hr_assign_section_head: {
        Args: { _head: string; _section: string }
        Returns: undefined
      }
      hr_file_access: { Args: { _path: string }; Returns: boolean }
      hr_head: { Args: { _officer: string }; Returns: boolean }
      hr_owner: { Args: { _officer: string }; Returns: boolean }
      hr_reader: { Args: { _officer: string }; Returns: boolean }
      hr_staff: { Args: never; Returns: boolean }
      hr_validate_files: { Args: { _files: Json }; Returns: undefined }
      ict_action: {
        Args: { _action: string; _id: string; _module: string; _payload?: Json }
        Returns: string
      }
      ict_directory: {
        Args: never
        Returns: {
          full_name: string
          id: string
          is_technician: boolean
          office_id: string
          section_id: string
          user_id: string
        }[]
      }
      ict_file_access: { Args: { _path: string }; Returns: boolean }
      ict_staff: { Args: never; Returns: boolean }
      ict_supervisor: { Args: { _officer: string }; Returns: boolean }
      instructor_course_access: { Args: { _course: string }; Returns: boolean }
      instructor_material_reader: { Args: { _path: string }; Returns: boolean }
      instructor_roster: { Args: never; Returns: Json }
      instructor_student_access: {
        Args: { _cadet: string; _course: string }
        Returns: boolean
      }
      instructor_uploaded_material: {
        Args: { _course: string; _path: string }
        Returns: boolean
      }
      instructor_workspace: { Args: never; Returns: boolean }
      leave_stage_role: {
        Args: { _stage: number }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      list_users_with_roles: {
        Args: never
        Returns: {
          email: string
          full_name: string
          id: string
          roles: Database["public"]["Enums"]["app_role"][]
        }[]
      }
      my_section: { Args: never; Returns: string }
      next_compilation_reference: { Args: never; Returns: string }
      next_hr_form_number: { Args: never; Returns: string }
      next_registry_reference: { Args: { _direction: string }; Returns: string }
      next_report_number: { Args: never; Returns: string }
      officer_owns: { Args: { _id: string }; Returns: boolean }
      officer_personal_file_reader: {
        Args: { _bucket: string; _path: string }
        Returns: boolean
      }
      officer_personal_only: { Args: never; Returns: boolean }
      official_email_for: {
        Args: { _first: string; _full: string; _last: string; _self: string }
        Returns: string
      }
      phase2_admin: { Args: never; Returns: boolean }
      phase2_workflow: {
        Args: { _action: string; _id: string; _module: string; _payload?: Json }
        Returns: string
      }
      procurement_action: {
        Args: {
          _action: string
          _date?: string
          _id: string
          _module: string
          _note?: string
        }
        Returns: undefined
      }
      procurement_reader: { Args: never; Returns: boolean }
      procurement_staff: { Args: never; Returns: boolean }
      record_activity: {
        Args: { _action: string; _id: string; _module: string }
        Returns: undefined
      }
      register_inventory: {
        Args: { _metadata: Json; _quantity: number }
        Returns: string
      }
      same_approval_scope: {
        Args: { _officer: string; _section: string }
        Returns: boolean
      }
      section_head_of: { Args: { _section: string }; Returns: boolean }
      submit_appointment: {
        Args: {
          _justification: string
          _officer: string
          _post: string
          _roles: Database["public"]["Enums"]["app_role"][]
        }
        Returns: string
      }
      supply_stage_role: {
        Args: { _stage: number }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      transfer_inventory: {
        Args: {
          _from: string
          _id: string
          _item: string
          _quantity: number
          _reason: string
          _to: string
        }
        Returns: undefined
      }
      verify_certificate: {
        Args: { _number: string }
        Returns: {
          cadet_name: string
          cadet_status: string
          certificate_number: string
          completion_date: string
          program_name: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "commandant"
        | "deputy_commandant"
        | "dc_admin"
        | "dc_academy"
        | "assistant_commissioner"
        | "section_head"
        | "officer"
        | "storekeeper"
        | "finance_officer"
        | "hr_officer"
        | "ict_admin"
        | "system_admin"
        | "registry_officer"
        | "finance_admin"
        | "auditor"
        | "procurement_officer"
        | "procurement_admin"
        | "hr_admin"
        | "facility_manager"
        | "iss_officer"
        | "ict_officer"
        | "media_officer"
        | "instructor"
        | "chief_instructor"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "commandant",
        "deputy_commandant",
        "dc_admin",
        "dc_academy",
        "assistant_commissioner",
        "section_head",
        "officer",
        "storekeeper",
        "finance_officer",
        "hr_officer",
        "ict_admin",
        "system_admin",
        "registry_officer",
        "finance_admin",
        "auditor",
        "procurement_officer",
        "procurement_admin",
        "hr_admin",
        "facility_manager",
        "iss_officer",
        "ict_officer",
        "media_officer",
        "instructor",
        "chief_instructor",
      ],
    },
  },
} as const
