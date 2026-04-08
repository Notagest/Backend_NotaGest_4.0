import User from '../models/userModel.js';
import { IUser } from '../interfaces/IUser.js';


// CREATE
// Tipamos os parâmetros como string e o retorno como uma Promise que entrega um IUser
export const createProfile = async (email: string, nome: string, senha: string): Promise<IUser> => {
  try {
    const newProfile = new User({ nome, email, senha });
    await newProfile.save();
    return newProfile;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new Error('Usuário já existe.', { cause: error });
    }
    console.error('Erro ao criar perfil:', error.message);
    throw new Error('Falha na criação do perfil.', { cause: error });
  }
};

// READ
export const getProfileById = async (_id: string): Promise<IUser | null> => {
  try {
    // O Mongoose já sabe que o retorno é IUser | null por causa da definição no Model
    return await User.findById(_id);
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error.message);
    throw new Error('Falha ao buscar o perfil.', { cause: error });
  }
};

// UPDATE
// updateData usa 'Partial<IUser>' para indicar que pode receber qualquer campo da interface IUser
export const updateProfileById = async (_id: string, updateData: Partial<IUser>): Promise<IUser | null> => {
  try {
    delete updateData.email; 
    
    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    return updatedProfile;
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error.message);
    throw new Error('Falha na atualização do perfil.', { cause: error });
  }
};

// DELETE
export const deleteProfileById = async (_id: string): Promise<boolean> => {
  try {
    const result = await User.findByIdAndDelete(_id);
    return !!result;
  } catch (error: any) {
    console.error('Erro ao deletar perfil:', error.message);
    throw new Error('Falha na exclusão do perfil.', { cause: error });
  }
};