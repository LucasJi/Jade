export type NoteObjectType = 'file' | 'dir';

export interface NoteObject {
  name: string;
  type: NoteObjectType;
  ext: string;
}

export interface BucketItem {
  name: string;
  size: number;
  etag: string;
  prefix?: never;
  lastModified: Date;
  isLatest: boolean;
  isDeleteMarker: boolean;
}
