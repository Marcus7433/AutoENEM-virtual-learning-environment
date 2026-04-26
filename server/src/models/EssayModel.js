const supabase = require('../config/supabase');

const BUCKET = 'essay-images';

const EssayModel = {
  async uploadImage({ buffer, mimetype, originalname, userId }) {
    const ext = originalname.split('.').pop().toLowerCase();
    const path = `${userId}/${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: mimetype, upsert: false });

    if (error) throw new Error(error.message);
    return data.path;
  },

  async save({ userId, title, topic, content, nota_final, feedback, imagePath }) {
    const { data, error } = await supabase
      .from('essays')
      .insert([{
        user_id: userId,
        title,
        topic,
        content,
        final_score: nota_final,
        feedback_json: feedback,
        image_url: imagePath || null,
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async findAllByUser(userId) {
    const { data, error } = await supabase
      .from('essays')
      .select('id, title, topic, final_score, image_url, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const essays = await Promise.all(
      data.map(async (essay) => {
        if (!essay.image_url) return essay;
        const { data: signed } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(essay.image_url, 3600);
        return { ...essay, image_signed_url: signed?.signedUrl ?? null };
      }),
    );

    return essays;
  },

  async findByIdAndUser(id, userId) {
    const { data, error } = await supabase
      .from('essays')
      .select('id, topic, content, final_score, feedback_json, image_url, created_at')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw Object.assign(new Error(error.message), { status: error.code === 'PGRST116' ? 404 : 500 });
    return data;
  },

  async deleteImage(imagePath) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([imagePath]);

    if (error) throw new Error(error.message);
  },

  async deleteByIdAndUser(id, userId) {
    const { error } = await supabase
      .from('essays')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
  },
};

module.exports = EssayModel;
