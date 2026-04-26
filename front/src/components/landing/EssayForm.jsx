import { Send, Upload } from 'lucide-react';

function EssayForm({
  topic,
  essayText,
  locked,
  isTranscribing,
  isSubmitting,
  selectedImage,
  hasTranscribed,
  saveImage,
  fileInputRef,
  onTopicChange,
  onEssayTextChange,
  onTranscrever,
  onCorrigir,
  onFileChange,
  onSaveImageToggle,
}) {
  const wordsCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
  const linesCount = essayText ? essayText.split('\n').length : 1;

  return (
    <section className="mx-auto mt-6 max-w-2xl rounded-2xl bg-white/20 p-8 shadow-md backdrop-blur-sm">
      <h1 className="text-center text-3xl font-bold text-white">Corretor de Redacao ENEM</h1>
      <p className="mt-2 text-center text-sm text-white/80">
        Envie sua redacao e receba uma analise completa baseada nos criterios do ENEM
      </p>

      <div className="mt-8 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-white/80">
          Tema da redacao
        </label>
        <input
          value={topic}
          onChange={onTopicChange}
          disabled={locked}
          placeholder="Ex: Os desafios da mobilidade urbana no Brasil"
          className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/80">
            Sua redacao
          </label>
          <span className="text-xs text-white/70">
            {wordsCount} palavras - {linesCount} {linesCount === 1 ? 'linha' : 'linhas'}
          </span>
        </div>

        <div className="relative">
          <textarea
            value={essayText}
            onChange={onEssayTextChange}
            disabled={isTranscribing || locked}
            rows={10}
            placeholder={isTranscribing ? '' : 'Digite ou cole sua redacao aqui...'}
            className="w-full rounded-xl border border-white/40 bg-white/90 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isTranscribing && (
            <div className="absolute inset-0 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm cursor-not-allowed" />
          )}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Dica: A redacao do ENEM deve ter entre 7 e 30 linhas</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        {selectedImage && (
          <p className="text-xs text-white/80">Imagem selecionada: {selectedImage.name}</p>
        )}

        <div className="mt-4 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onTranscrever}
              disabled={isTranscribing || locked}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload size={16} />
              {isTranscribing ? 'Transcrevendo...' : 'Transcrever redacao'}
            </button>

            {hasTranscribed && (
              <label className={`flex cursor-pointer items-center gap-2 select-none ${isSubmitting || locked ? 'cursor-not-allowed opacity-50' : ''}`}>
                <button
                  type="button"
                  role="switch"
                  aria-checked={saveImage}
                  onClick={onSaveImageToggle}
                  disabled={isSubmitting || locked}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed ${saveImage ? 'bg-brand' : 'bg-white/40'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${saveImage ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/80">Salvar imagem</span>
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={onCorrigir}
            disabled={isSubmitting || locked}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
            {isSubmitting ? 'Analisando...' : 'Enviar para Correcao'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default EssayForm;
