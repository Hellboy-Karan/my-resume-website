import { useEffect, useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline } from 'lucide-react';
import { formatRichText } from '../utils/formatting.js';

export default function RichTextEditor({ label, value = '', onChange, minHeight = '180px', placeholder = 'Write formatted content...' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = formatRichText(value);
    }
  }, [value]);

  function run(command, argument = null) {
    editorRef.current?.focus();
    document.execCommand(command, false, argument);
    emitChange();
  }

  function addLink() {
    const url = window.prompt('Enter link URL');
    if (!url) return;
    run('createLink', url);
  }

  function emitChange() {
    onChange?.(editorRef.current?.innerHTML || '');
  }

  return (
    <label className="block">
      {label && <span className="text-xs font-black uppercase text-slate-500">{label}</span>}
      <div className="mt-2 overflow-hidden rounded-md border border-slate-300 bg-white">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
          <ToolButton label="Bold" onClick={() => run('bold')}><Bold size={15} /></ToolButton>
          <ToolButton label="Italic" onClick={() => run('italic')}><Italic size={15} /></ToolButton>
          <ToolButton label="Underline" onClick={() => run('underline')}><Underline size={15} /></ToolButton>
          <ToolButton label="Bullet list" onClick={() => run('insertUnorderedList')}><List size={15} /></ToolButton>
          <ToolButton label="Numbered list" onClick={() => run('insertOrderedList')}><ListOrdered size={15} /></ToolButton>
          <ToolButton label="Link" onClick={addLink}><LinkIcon size={15} /></ToolButton>
        </div>
        <div
          ref={editorRef}
          className="rich-editor-content min-h-40 px-3 py-3 text-sm leading-7 outline-none"
          contentEditable
          data-placeholder={placeholder}
          style={{ minHeight }}
          onInput={emitChange}
          onBlur={emitChange}
          suppressContentEditableWarning
        />
      </div>
    </label>
  );
}

function ToolButton({ label, onClick, children }) {
  return (
    <button className="rounded border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100" type="button" title={label} onClick={onClick}>
      {children}
    </button>
  );
}
