import { Schema, model } from 'mongoose';
import { IFile } from '../interfaces/IFile.js';

const arquivoSchema = new Schema<IFile>({
  user: { 
    type: Schema.Types.ObjectId, 
    required: true, 
    ref: 'User' 
  },
  title: { 
    type: String, 
    required: [true, 'O título é obrigatório'] 
  },
  value: { 
    type: Number, 
    required: [true, 'O valor é obrigatório'] 
  },
  purchaseDate: { 
    type: Date, 
    required: [true, 'A data da compra é obrigatória'] 
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Imovel', 
    required: [true, 'O imóvel é obrigatório']
  },
  category: { 
    type: String, 
    required: [true, 'A categoria é obrigatória'] 
  },
  subcategory: { 
    type: String, 
    required: [true, 'A subcategoria é obrigatória'] 
  },
  observation: { type: String },
  filePath: { type: String },
  embeddings: { 
    type: [Number], 
    default: [] 
  }
}, { 
  timestamps: true 
});

const FileModel = model<IFile>('Arquivo', arquivoSchema);

export default FileModel;