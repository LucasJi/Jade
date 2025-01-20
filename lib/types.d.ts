export type NoteObjectType = 'file' | 'dir';

export interface NoteObject {
  path: string;
  type: NoteObjectType;
  ext: string;
  lastModified: Date | undefined;
}
