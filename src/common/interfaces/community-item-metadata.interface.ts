export interface CommunityItemMetadata {
  // Event-specific
  eventDate?: Date;
  eventLocation?: string;
  eventEndDate?: Date;

  // Resource-specific
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;

  // Poll-specific
  pollOptions?: string[];
  pollResults?: Record<string, number>; // option -> vote count mapping
  pollEndDate?: Date;
  allowMultipleVotes?: boolean;

  // General metadata
  [key: string]: any;
}
