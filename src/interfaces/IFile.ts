import { Document, Schema } from 'mongoose';

/**
 * Interface para o Arquivo (Nota Fiscal/Documento).
 */
export interface IFile extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  value: number;
  purchaseDate: Date;
  property: Schema.Types.ObjectId;
  category: string;
  subcategory: string;
  observation?: string;             // Opcional
  filePath?: string;                // Opcional
  embeddings?: number[];            // Vetor para RAG
  createdAt: Date;
  updatedAt: Date;
}