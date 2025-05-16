import { supabase } from './supabase';

// Profile operations
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// Exchange Ad operations
export const createAd = async (adData) => {
  try {
    const { data, error } = await supabase
      .from('exchange_ads')
      .insert(adData)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating ad:', error);
    return { data: null, error };
  }
};

export const getAds = async (filters = {}) => {
  try {
    let query = supabase.from('exchange_ads').select(`
      *,
      profiles:user_id (username, full_name, rating)
    `).order('created_at', { ascending: false });
    
    // Apply filters
    if (filters.currency) {
      query = query.or(`currency.eq.${filters.currency},target_currency.eq.${filters.currency}`);
    }
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching ads:', error);
    return { data: null, error };
  }
};

export const deleteAd = async (adId, userId) => {
  try {
    const { error } = await supabase
      .from('exchange_ads')
      .delete()
      .eq('id', adId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting ad:', error);
    return { success: false, error };
  }
};

// Chat operations
export const createChat = async (adId, senderId, receiverId) => {
  try {
    // Check if chat already exists
    const { data: existingChat, error: checkError } = await supabase
      .from('chats')
      .select('id')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
      .eq('ad_id', adId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existingChat) {
      return { data: existingChat, error: null };
    }
    
    // Create new chat
    const { data, error } = await supabase
      .from('chats')
      .insert({
        ad_id: adId,
        sender_id: senderId,
        receiver_id: receiverId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating chat:', error);
    return { data: null, error };
  }
};

export const getChats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select(`
        *,
        exchange_ads:ad_id (*),
        sender:sender_id (username, full_name),
        receiver:receiver_id (username, full_name),
        messages:id (
          id,
          content,
          created_at,
          user_id
        )
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching chats:', error);
    return { data: null, error };
  }
};

export const sendMessage = async (chatId, userId, content) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        content,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sending message:', error);
    return { data: null, error };
  }
};

export const getMessages = async (chatId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:user_id (username, full_name)
      `)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
}; 