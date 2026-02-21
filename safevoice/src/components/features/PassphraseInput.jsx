import { useState } from 'react';
import { KeyRound, Replace, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';

export function PassphraseInput({ onSubmit, isLoading }) {
    const [mode, setMode] = useState('paste'); // 'paste' or 'words'
    const [words, setWords] = useState(Array(12).fill(''));
    const [pasteString, setPasteString] = useState('');
    const [visible, setVisible] = useState(false);

    const handlePasteChange = (e) => {
        setPasteString(e.target.value);
    };

    const handleWordChange = (index, value) => {
        const newWords = [...words];
        newWords[index] = value;
        setWords(newWords);
    };

    const handlePasteIntoCell = (e, index) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        const pastedWords = text.trim().split(/\s+/);

        if (pastedWords.length > 1) {
            const newWords = [...words];
            pastedWords.slice(0, 12).forEach((w, i) => {
                if (index + i < 12) newWords[index + i] = w;
            });
            setWords(newWords);
        } else {
            handleWordChange(index, text);
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (mode === 'paste') {
            const extractedWords = pasteString.trim().split(/\s+/);
            if (extractedWords.length !== 12) {
                alert('Please enter exactly 12 words separated by spaces.');
                return;
            }
            onSubmit(extractedWords.join(' '));
        } else {
            if (words.some(w => !w.trim())) {
                alert('Please fill in all 12 words.');
                return;
            }
            onSubmit(words.map(w => w.trim()).join(' '));
        }
    };

    return (
        <div className="bg-bg-secondary p-6 sm:p-8 rounded-2xl border border-border-default shadow-xl max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-display text-text-primary flex items-center gap-2">
                        <KeyRound className="w-6 h-6 text-accent-primary" />
                        Enter Passphrase
                    </h2>
                    <p className="text-sm text-text-muted mt-1">Provide your 12-word recovery phrase to authenticate.</p>
                </div>

                <button
                    type="button"
                    onClick={() => setMode(mode === 'paste' ? 'words' : 'paste')}
                    className="text-xs font-medium text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1 bg-bg-surface px-3 py-1.5 rounded border border-border-default"
                >
                    <Replace className="w-3.5 h-3.5" />
                    Switch to {mode === 'paste' ? '24/12 Words Input' : 'Paste Box'}
                </button>
            </div>

            <form onSubmit={submitForm}>
                {mode === 'paste' ? (
                    <div className="relative mb-6">
                        <textarea
                            className="w-full h-32 bg-bg-surface border border-border-default rounded-xl p-4 text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary focus:outline-none resize-none font-mono"
                            placeholder="e.g. maple river cloud anchor stone bridge forest amber wave orbit silent pulse"
                            value={pasteString}
                            onChange={handlePasteChange}
                            required
                        />
                        {pasteString.trim().split(/\s+/).length > 0 && pasteString.trim() !== '' && (
                            <div className="absolute bottom-3 right-3 text-xs bg-bg-primary/80 backdrop-blur px-2 py-1 rounded border border-border-default text-text-muted font-mono">
                                {pasteString.trim().split(/\s+/).length}/12 words
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-6 relative">
                        <div className="absolute -top-10 right-0 z-10">
                            <button
                                type="button"
                                onClick={() => setVisible(!visible)}
                                className="text-text-muted hover:text-text-primary transition-colors p-2"
                                title={visible ? 'Hide Words' : 'Show Words'}
                            >
                                {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {words.map((word, idx) => (
                                <div key={idx} className="relative">
                                    <span className="absolute left-3 top-2.5 text-xs text-text-muted select-none w-4 text-right">
                                        {idx + 1}.
                                    </span>
                                    <input
                                        type={visible ? "text" : "password"}
                                        className="w-full bg-bg-surface border border-border-default rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-transparent focus:ring-2 focus:ring-accent-primary focus:outline-none font-mono transition-shadow"
                                        value={word}
                                        onChange={(e) => handleWordChange(idx, e.target.value)}
                                        onPaste={(e) => handlePasteIntoCell(e, idx)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-12 text-base font-semibold"
                    disabled={isLoading}
                >
                    {isLoading ? 'Verifying Identity...' : 'Access Dashboard'}
                </Button>
            </form>

            <div className="mt-4 text-center">
                <p className="text-xs text-text-muted flex items-center justify-center gap-1.5 opacity-80">
                    <Lock className="w-3.5 h-3.5 text-accent-primary" />
                    Your passphrase never leaves your device. We use zero-knowledge proofs.
                </p>
            </div>
        </div>
    );
}

import { Lock } from 'lucide-react';
