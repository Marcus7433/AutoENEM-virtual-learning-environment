import { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from 'react';
import CorrectionResult from '../components/landing/CorrectionResult';
import DeleteConfirmModal from '../components/landing/DeleteConfirmModal';
import EssayForm from '../components/landing/EssayForm';
import FloatingActions from '../components/landing/FloatingActions';
import PageShell from '../components/layout/PageShell';
import { useAuthPrompt } from '../hooks/useAuthPrompt';
import { useAuth } from '../hooks/useAuth';
import { API } from '../lib/api';
import { clearEssayDraft } from '../lib/essayDraft';

// Rendered inside PageShell so useAuthPrompt() has access to context
const LandingContent = forwardRef(function LandingContent(_, ref) {
  const openAuth = useAuthPrompt();
  const { user } = useAuth();
  const resultRef = useRef(null);
  const fileInputRef = useRef(null);

  const [topic, setTopic] = useState(() => localStorage.getItem('autoenem_topic') ?? '');
  const [essayText, setEssayText] = useState(() => localStorage.getItem('autoenem_essay') ?? '');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [pendingTranscription, setPendingTranscription] = useState(false);
  const [hasTranscribed, setHasTranscribed] = useState(false);
  const [saveImage, setSaveImage] = useState(true);
  const [feedback, setFeedback] = useState(() => {
    const raw = localStorage.getItem('autoenem_feedback');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const locked = feedback !== null;

  useEffect(() => {
    if (feedback) localStorage.setItem('autoenem_feedback', JSON.stringify(feedback));
    else localStorage.removeItem('autoenem_feedback');
  }, [feedback]);

  const resetPage = useCallback(() => {
    setFeedback(null);
    setTopic('');
    setEssayText('');
    setSelectedImage(null);
    setHasTranscribed(false);
    setSaveImage(true);
    clearEssayDraft();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useImperativeHandle(ref, () => ({ reset: resetPage }), [resetPage]);

  const requireAuth = () => {
    if (!user) { openAuth('center'); return false; }
    return true;
  };

  const transcribeImageFile = async (file) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch('http://localhost:5001/transcrever', { method: 'POST', body: formData });
      if (!response.ok) throw new Error((await response.text()) || 'Falha na transcricao.');
      const data = await response.json();
      const text = data.texto_transcrito ?? data.transcricao ?? data.text ?? data.content ?? '';
      if (!text) throw new Error('Resposta da transcricao veio vazia.');
      setEssayText(text);
      localStorage.setItem('autoenem_essay', text);
      setHasTranscribed(true);
    } catch (error) {
      alert(`Erro ao transcrever: ${error.message}`); // eslint-disable-line no-alert
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    if (!file || !pendingTranscription) return;
    setPendingTranscription(false);
    await transcribeImageFile(file);
  };

  const handleTranscrever = () => {
    if (!requireAuth()) return;
    setPendingTranscription(true);
    fileInputRef.current?.click();
  };

  const handleCorrigir = async () => {
    if (!requireAuth()) return;
    if (!topic.trim() || !essayText.trim()) {
      alert('Preencha o tema e o texto da redacao.'); // eslint-disable-line no-alert
      return;
    }
    if (essayText.trim().length < 50) {
      alert('O texto da redacao deve ter pelo menos 50 caracteres.'); // eslint-disable-line no-alert
      return;
    }
    try {
      setIsSubmitting(true);
      setFeedback(null);
      const formData = new FormData();
      formData.append('title', topic.slice(0, 100));
      formData.append('topic', topic);
      formData.append('content', essayText);
      if (saveImage && selectedImage) formData.append('image', selectedImage);
      const response = await fetch(`${API}/api/essays`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        let msg = 'Falha ao enviar para correcao.';
        try { const d = await response.json(); msg = d.message || msg; } catch { msg = (await response.text()) || msg; }
        throw new Error(msg);
      }
      const data = await response.json();
      setFeedback(data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    } catch (error) {
      alert(error.message); // eslint-disable-line no-alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!feedback?.id) { resetPage(); setShowDeleteModal(false); return; }
    try {
      setIsDeleting(true);
      const response = await fetch(`${API}/api/essays/${feedback.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        let msg = 'Erro ao excluir redacao.';
        try { const d = await response.json(); msg = d.message || msg; } catch { /* noop */ }
        throw new Error(msg);
      }
      setShowDeleteModal(false);
      resetPage();
    } catch (error) {
      alert(error.message); // eslint-disable-line no-alert
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <EssayForm
        topic={topic}
        essayText={essayText}
        locked={locked}
        isTranscribing={isTranscribing}
        isSubmitting={isSubmitting}
        selectedImage={selectedImage}
        hasTranscribed={hasTranscribed}
        saveImage={saveImage}
        fileInputRef={fileInputRef}
        onTopicChange={(e) => { setTopic(e.target.value); localStorage.setItem('autoenem_topic', e.target.value); }}
        onEssayTextChange={(e) => { setEssayText(e.target.value); localStorage.setItem('autoenem_essay', e.target.value); }}
        onTranscrever={handleTranscrever}
        onCorrigir={handleCorrigir}
        onFileChange={handleFileChange}
        onSaveImageToggle={() => setSaveImage((prev) => !prev)}
      />

      {feedback && <CorrectionResult feedback={feedback} resultRef={resultRef} />}

      {locked && <FloatingActions onNova={resetPage} onDelete={() => setShowDeleteModal(true)} />}

      {showDeleteModal && (
        <DeleteConfirmModal
          isDeleting={isDeleting}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmarExclusao}
        />
      )}
    </>
  );
});

function LandingPage() {
  const contentRef = useRef(null);
  const reset = () => contentRef.current?.reset();

  return (
    <PageShell onNova={reset} onLogout={reset}>
      <LandingContent ref={contentRef} />
    </PageShell>
  );
}

export default LandingPage;
